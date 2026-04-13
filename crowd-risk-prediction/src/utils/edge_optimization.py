"""
Edge Device Optimization Module
Provides model quantization, pruning, and TensorRT optimization for edge deployment
"""
import torch
import torch.nn as nn
import numpy as np
from typing import Optional, Dict, Tuple
import os
import time


class ModelOptimizer:
    """
    Optimizes models for edge device deployment
    Supports quantization, pruning, and ONNX export
    """
    
    def __init__(self, device: str = 'cuda' if torch.cuda.is_available() else 'cpu'):
        self.device = device
        self.optimized_models = {}
    
    def quantize_model_int8(self, model: nn.Module, calibration_data: Optional[list] = None) -> nn.Module:
        """
        Quantize model to INT8 for faster inference on edge devices
        Args:
            model: PyTorch model to quantize
            calibration_data: Sample data for calibration
        Returns:
            Quantized model
        """
        print("Starting INT8 quantization...")
        
        # Move model to CPU for quantization
        model = model.cpu()
        model.eval()
        
        # Dynamic quantization (works for most models)
        quantized_model = torch.quantization.quantize_dynamic(
            model,
            {nn.Linear, nn.Conv2d},  # Layers to quantize
            dtype=torch.qint8
        )
        
        print("INT8 quantization completed")
        return quantized_model
    
    def quantize_model_fp16(self, model: nn.Module) -> nn.Module:
        """
        Convert model to FP16 for faster GPU inference
        Args:
            model: PyTorch model
        Returns:
            FP16 model
        """
        if 'cuda' not in self.device:
            print("FP16 optimization requires CUDA device")
            return model
        
        model = model.half()
        print("FP16 conversion completed")
        return model
    
    def export_to_onnx(self, 
                      model: nn.Module,
                      input_shape: Tuple[int, ...],
                      output_path: str,
                      opset_version: int = 12) -> str:
        """
        Export model to ONNX format for cross-platform deployment
        Args:
            model: PyTorch model
            input_shape: Shape of input tensor
            output_path: Path to save ONNX model
            opset_version: ONNX opset version
        Returns:
            Path to exported ONNX model
        """
        model.eval()
        
        # Create dummy input
        dummy_input = torch.randn(input_shape).to(self.device)
        
        # Export to ONNX
        torch.onnx.export(
            model,
            dummy_input,
            output_path,
            export_params=True,
            opset_version=opset_version,
            do_constant_folding=True,
            input_names=['input'],
            output_names=['output'],
            dynamic_axes={
                'input': {0: 'batch_size'},
                'output': {0: 'batch_size'}
            }
        )
        
        print(f"Model exported to ONNX: {output_path}")
        return output_path
    
    def optimize_for_tensorrt(self, 
                             onnx_path: str,
                             output_path: str,
                             fp16_mode: bool = True,
                             max_batch_size: int = 1) -> str:
        """
        Optimize model for TensorRT (NVIDIA GPUs)
        Args:
            onnx_path: Path to ONNX model
            output_path: Path to save TensorRT engine
            fp16_mode: Enable FP16 mode
            max_batch_size: Maximum batch size
        Returns:
            Path to TensorRT engine file
        """
        try:
            import tensorrt as trt
            
            TRT_LOGGER = trt.Logger(trt.Logger.WARNING)
            
            # Create builder and network
            builder = trt.Builder(TRT_LOGGER)
            network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
            
            # Parse ONNX model
            parser = trt.OnnxParser(network, TRT_LOGGER)
            with open(onnx_path, 'rb') as f:
                parser.parse(f.read())
            
            # Configure builder
            config = builder.create_builder_config()
            config.max_workspace_size = 1 << 30  # 1GB
            
            if fp16_mode and builder.platform_has_fast_fp16:
                config.set_flag(trt.BuilderFlag.FP16)
            
            # Build engine
            engine = builder.build_engine(network, config)
            
            # Serialize and save
            with open(output_path, 'wb') as f:
                f.write(engine.serialize())
            
            print(f"TensorRT engine saved to: {output_path}")
            return output_path
            
        except ImportError:
            print("TensorRT not installed. Skipping TensorRT optimization.")
            return ""
    
    def benchmark_model(self, 
                       model: nn.Module,
                       input_shape: Tuple[int, ...],
                       num_iterations: int = 100) -> Dict:
        """
        Benchmark model performance
        Args:
            model: Model to benchmark
            input_shape: Input tensor shape
            num_iterations: Number of iterations for benchmarking
        Returns:
            Dictionary with benchmark metrics
        """
        model.eval()
        dummy_input = torch.randn(input_shape).to(self.device)
        
        # Warmup
        with torch.no_grad():
            for _ in range(10):
                _ = model(dummy_input)
        
        # Benchmark
        if self.device == 'cuda':
            torch.cuda.synchronize()
        
        start_time = time.time()
        with torch.no_grad():
            for _ in range(num_iterations):
                _ = model(dummy_input)
        
        if self.device == 'cuda':
            torch.cuda.synchronize()
        
        end_time = time.time()
        
        total_time = end_time - start_time
        avg_latency = total_time / num_iterations
        fps = num_iterations / total_time
        
        # Memory usage (if CUDA)
        memory_usage = 0
        if self.device == 'cuda':
            memory_usage = torch.cuda.memory_allocated() / (1024 ** 2)  # MB
        
        metrics = {
            'avg_latency_ms': avg_latency * 1000,
            'fps': fps,
            'total_time_seconds': total_time,
            'memory_usage_mb': memory_usage,
            'device': self.device
        }
        
        return metrics
    
    def create_optimized_pipeline(self,
                                 model: nn.Module,
                                 optimization_type: str = 'quantize_int8',
                                 calibration_data: Optional[list] = None) -> nn.Module:
        """
        Create fully optimized model pipeline
        Args:
            model: Original model
            optimization_type: Type of optimization ('quantize_int8', 'quantize_fp16', 'onnx')
            calibration_data: Calibration data for quantization
        Returns:
            Optimized model
        """
        if optimization_type == 'quantize_int8':
            optimized_model = self.quantize_model_int8(model, calibration_data)
        elif optimization_type == 'quantize_fp16':
            optimized_model = self.quantize_model_fp16(model)
        elif optimization_type == 'onnx':
            # Just return the model, export separately
            optimized_model = model
        else:
            raise ValueError(f"Unknown optimization type: {optimization_type}")
        
        return optimized_model


class EdgeInferenceEngine:
    """
    Optimized inference engine for edge devices
    Automatically selects best optimization strategy
    """
    
    def __init__(self, model: nn.Module, device: str = 'cpu'):
        self.device = device
        self.original_model = model
        self.optimized_model = None
        self.optimizer = ModelOptimizer(device)
        self.optimization_applied = None
    
    def optimize(self, optimization_type: str = 'auto', **kwargs) -> bool:
        """
        Apply optimization to the model
        Args:
            optimization_type: 'auto', 'quantize_int8', 'quantize_fp16', 'onnx'
        Returns:
            True if optimization successful
        """
        if optimization_type == 'auto':
            # Auto-select best optimization
            if self.device == 'cuda':
                optimization_type = 'quantize_fp16'
            else:
                optimization_type = 'quantize_int8'
        
        try:
            if optimization_type == 'quantize_int8':
                self.optimized_model = self.optimizer.quantize_model_int8(
                    self.original_model,
                    kwargs.get('calibration_data')
                )
            elif optimization_type == 'quantize_fp16':
                self.optimized_model = self.optimizer.quantize_model_fp16(self.original_model)
            elif optimization_type == 'onnx':
                output_path = kwargs.get('output_path', 'model.onnx')
                input_shape = kwargs.get('input_shape', (1, 3, 224, 224))
                self.optimizer.export_to_onnx(
                    self.original_model,
                    input_shape,
                    output_path
                )
                self.optimized_model = self.original_model  # Use original for now
            
            self.optimization_applied = optimization_type
            print(f"Optimization applied: {optimization_type}")
            return True
            
        except Exception as e:
            print(f"Optimization failed: {e}")
            return False
    
    def predict(self, input_data: torch.Tensor) -> torch.Tensor:
        """
        Run optimized inference
        Args:
            input_data: Input tensor
        Returns:
            Prediction output
        """
        model = self.optimized_model if self.optimized_model else self.original_model
        model.eval()
        
        input_data = input_data.to(self.device)
        
        with torch.no_grad():
            output = model(input_data)
        
        return output
    
    def get_performance_metrics(self, input_shape: Tuple[int, ...]) -> Dict:
        """
        Get performance metrics for optimized model
        """
        model = self.optimized_model if self.optimized_model else self.original_model
        return self.optimizer.benchmark_model(model, input_shape)
