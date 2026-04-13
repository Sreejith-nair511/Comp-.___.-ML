"""
Advanced ML Pipeline for Crowd Risk Analysis
Implements comprehensive supervised and unsupervised learning algorithms
"""
import numpy as np
import torch
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, IsolationForest
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.neural_network import MLPClassifier
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple, Optional
import joblib
import os


class AdvancedCrowdAnalyzer:
    """
    Comprehensive ML pipeline combining multiple algorithms for accurate crowd analysis
    """
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        os.makedirs(model_dir, exist_ok=True)
        
        # Initialize scalers
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=0.95)  # Keep 95% variance
        
        # Supervised Learning Models
        self.classifiers = {
            'random_forest': RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42),
            'gradient_boosting': GradientBoostingClassifier(n_estimators=150, learning_rate=0.1, random_state=42),
            'svm': SVC(kernel='rbf', probability=True, random_state=42),
            'logistic_regression': LogisticRegression(max_iter=1000, random_state=42),
            'mlp': MLPClassifier(hidden_layer_sizes=(128, 64, 32), max_iter=500, random_state=42)
        }
        
        # Regression Models
        self.regressors = {
            'ridge': Ridge(alpha=1.0),
            'random_forest_reg': RandomForestRegressor(n_estimators=200, random_state=42),
            'gradient_boosting_reg': GradientBoostingRegressor(n_estimators=150, random_state=42)
        }
        
        # Unsupervised Learning Models
        self.clustering_models = {
            'kmeans': KMeans(n_clusters=5, random_state=42),
            'isolation_forest': IsolationForest(contamination=0.1, random_state=42),
            'dbscan': DBSCAN(eps=0.5, min_samples=5)
        }
        
        # Ensemble weights (learned from validation)
        self.ensemble_weights = {
            'random_forest': 0.30,
            'gradient_boosting': 0.35,
            'svm': 0.15,
            'logistic_regression': 0.10,
            'mlp': 0.10
        }
        
        self.is_fitted = False
    
    def extract_comprehensive_features(self, 
                                      density_map: np.ndarray,
                                      flow_data: Dict,
                                      historical_data: Optional[List] = None) -> np.ndarray:
        """
        Extract comprehensive feature vector from crowd data
        Returns: Feature vector (1D numpy array)
        """
        features = []
        
        # 1. Density Features
        features.append(np.mean(density_map))
        features.append(np.std(density_map))
        features.append(np.max(density_map))
        features.append(np.min(density_map))
        features.append(np.median(density_map))
        
        # 2. Spatial Distribution Features
        h, w = density_map.shape
        quadrants = [
            density_map[:h//2, :w//2],
            density_map[:h//2, w//2:],
            density_map[h//2:, :w//2],
            density_map[h//2:, w//2:]
        ]
        for quad in quadrants:
            features.append(np.mean(quad))
            features.append(np.std(quad))
        
        # 3. Gradient Features
        grad_y, grad_x = np.gradient(density_map)
        features.append(np.mean(np.abs(grad_x)))
        features.append(np.mean(np.abs(grad_y)))
        features.append(np.std(np.abs(grad_x)))
        features.append(np.std(np.abs(grad_y)))
        
        # 4. Flow Features
        if 'magnitude_map' in flow_data:
            mag = flow_data['magnitude_map']
            features.append(np.mean(mag))
            features.append(np.std(mag))
            features.append(np.max(mag))
        
        if 'angle_map' in flow_data:
            angle = flow_data['angle_map']
            # Directional entropy
            hist, _ = np.histogram(angle, bins=36, range=(0, 360))
            hist = hist / hist.sum()
            entropy = -np.sum(hist * np.log(hist + 1e-10))
            features.append(entropy)
            features.append(np.std(angle))
        
        # 5. Motion Compression Features
        if 'magnitude_map' in flow_data:
            mag = flow_data['magnitude_map']
            # Local variance (indicates compression)
            from scipy.ndimage import uniform_filter
            local_mean = uniform_filter(mag, size=10)
            local_var = uniform_filter(mag**2, size=10) - local_mean**2
            features.append(np.mean(local_var))
            features.append(np.max(local_var))
        
        # 6. Temporal Features (if historical data available)
        if historical_data and len(historical_data) > 1:
            recent_scores = [h.get('ciri_score', 0) for h in historical_data[-10:]]
            features.append(np.mean(recent_scores))
            features.append(np.std(recent_scores))
            features.append(np.max(recent_scores))
            # Trend
            if len(recent_scores) > 1:
                trend = np.polyfit(range(len(recent_scores)), recent_scores, 1)[0]
                features.append(trend)
        
        # 7. Crowd Density Classification Features
        total_people = np.sum(density_map)
        features.append(total_people)
        features.append(total_people / (h * w))  # Density ratio
        
        # High density regions
        high_density_mask = density_map > np.percentile(density_map, 90)
        features.append(np.sum(high_density_mask))
        features.append(np.sum(high_density_mask) / (h * w))
        
        return np.array(features)
    
    def classify_crowd_density(self, features: np.ndarray) -> Dict:
        """
        Classify crowd into density categories using ensemble
        Categories: Very Low, Low, Medium, High, Very High
        """
        if not self.is_fitted:
            # Return heuristic classification if not trained
            density_score = features[0]  # Mean density
            
            if density_score < 0.2:
                category = "Very Low"
                confidence = 0.8
            elif density_score < 0.4:
                category = "Low"
                confidence = 0.75
            elif density_score < 0.6:
                category = "Medium"
                confidence = 0.7
            elif density_score < 0.8:
                category = "High"
                confidence = 0.75
            else:
                category = "Very High"
                confidence = 0.8
            
            return {
                'category': category,
                'confidence': confidence,
                'method': 'heuristic'
            }
        
        # Ensemble classification
        scaled_features = self.scaler.transform(features.reshape(1, -1))
        
        predictions = {}
        for name, classifier in self.classifiers.items():
            pred_proba = classifier.predict_proba(scaled_features)[0]
            predictions[name] = pred_proba
        
        # Weighted ensemble
        ensemble_proba = np.zeros_like(list(predictions.values())[0])
        for name, proba in predictions.items():
            ensemble_proba += self.ensemble_weights[name] * proba
        
        # Get prediction
        categories = ["Very Low", "Low", "Medium", "High", "Very High"]
        predicted_class = np.argmax(ensemble_proba)
        confidence = ensemble_proba[predicted_class]
        
        return {
            'category': categories[predicted_class],
            'confidence': float(confidence),
            'probabilities': {cat: float(p) for cat, p in zip(categories, ensemble_proba)},
            'method': 'ensemble_ml'
        }
    
    def predict_risk_score(self, features: np.ndarray) -> Dict:
        """
        Predict continuous risk score using regression ensemble
        """
        if not self.is_fitted:
            # Heuristic risk calculation
            density = features[0]
            motion = features[10] if len(features) > 10 else 0
            entropy = features[13] if len(features) > 13 else 0
            
            risk = 0.4 * density + 0.3 * motion + 0.3 * (entropy / 4.0)
            risk = np.clip(risk, 0, 1)
            
            return {
                'risk_score': float(risk),
                'method': 'heuristic'
            }
        
        # Regression ensemble
        scaled_features = self.scaler.transform(features.reshape(1, -1))
        
        predictions = []
        for name, regressor in self.regressors.items():
            pred = regressor.predict(scaled_features)[0]
            predictions.append(pred)
        
        avg_risk = np.mean(predictions)
        std_risk = np.std(predictions)
        
        return {
            'risk_score': float(np.clip(avg_risk, 0, 1)),
            'uncertainty': float(std_risk),
            'predictions': {name: float(p) for name, p in zip(self.regressors.keys(), predictions)},
            'method': 'ensemble_regression'
        }
    
    def detect_anomalies(self, features: np.ndarray) -> Dict:
        """
        Detect anomalous crowd patterns using unsupervised learning
        """
        if not self.is_fitted:
            # Simple statistical anomaly detection
            z_score = abs(features[0] - 0.5) / 0.3
            is_anomaly = z_score > 2
            
            return {
                'is_anomaly': bool(is_anomaly),
                'anomaly_score': float(min(z_score / 3, 1.0)),
                'method': 'statistical'
            }
        
        # Isolation Forest
        scaled_features = self.scaler.transform(features.reshape(1, -1))
        anomaly_score = self.clustering_models['isolation_forest'].decision_function(scaled_features)[0]
        is_anomaly = self.clustering_models['isolation_forest'].predict(scaled_features)[0] == -1
        
        return {
            'is_anomaly': bool(is_anomaly),
            'anomaly_score': float(anomaly_score),
            'method': 'isolation_forest'
        }
    
    def cluster_crowd_patterns(self, features_batch: np.ndarray) -> Dict:
        """
        Cluster crowd patterns to identify different scenarios
        """
        if not self.is_fitted or len(features_batch) < 10:
            return {
                'clusters': None,
                'message': 'Insufficient data for clustering'
            }
        
        scaled_features = self.scaler.transform(features_batch)
        cluster_labels = self.clustering_models['kmeans'].fit_predict(scaled_features)
        
        # Cluster statistics
        unique_clusters = np.unique(cluster_labels)
        cluster_info = {}
        for cluster_id in unique_clusters:
            mask = cluster_labels == cluster_id
            cluster_info[f'cluster_{cluster_id}'] = {
                'count': int(np.sum(mask)),
                'avg_risk': float(np.mean(features_batch[mask, 0])),
                'percentage': float(np.sum(mask) / len(cluster_labels) * 100)
            }
        
        return {
            'clusters': cluster_labels.tolist(),
            'cluster_info': cluster_info,
            'num_clusters': len(unique_clusters),
            'method': 'kmeans'
        }
    
    def apply_pca(self, features_batch: np.ndarray) -> Dict:
        """
        Apply PCA for dimensionality reduction and visualization
        """
        if len(features_batch) < 5:
            return {'error': 'Insufficient data for PCA'}
        
        scaled_features = self.scaler.transform(features_batch)
        reduced_features = self.pca.fit_transform(scaled_features)
        
        return {
            'reduced_features': reduced_features.tolist(),
            'explained_variance': self.pca.explained_variance_ratio_.tolist(),
            'n_components': self.pca.n_components_,
            'total_variance_explained': float(np.sum(self.pca.explained_variance_ratio_))
        }
    
    def train(self, X_train: np.ndarray, y_train_class: np.ndarray, y_train_reg: np.ndarray):
        """
        Train all ML models
        X_train: Feature matrix
        y_train_class: Classification labels (0-4 for density categories)
        y_train_reg: Continuous risk scores (0-1)
        """
        print("Training Advanced ML Pipeline...")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X_train)
        
        # Apply PCA
        X_pca = self.pca.fit_transform(X_scaled)
        
        # Train classifiers
        print("Training classifiers...")
        for name, classifier in self.classifiers.items():
            classifier.fit(X_pca, y_train_class)
            print(f"  ✓ {name} trained")
        
        # Train regressors
        print("Training regressors...")
        for name, regressor in self.regressors.items():
            regressor.fit(X_pca, y_train_reg)
            print(f"  ✓ {name} trained")
        
        # Train clustering
        print("Training unsupervised models...")
        self.clustering_models['kmeans'].fit(X_pca)
        self.clustering_models['isolation_forest'].fit(X_pca)
        
        self.is_fitted = True
        print("✅ All models trained successfully!")
        
        # Save models
        self.save_models()
    
    def save_models(self):
        """Save all trained models"""
        models_path = os.path.join(self.model_dir, 'ml_models.joblib')
        
        model_data = {
            'classifiers': {name: model for name, model in self.classifiers.items()},
            'regressors': {name: model for name, model in self.regressors.items()},
            'clustering': {name: model for name, model in self.clustering_models.items()},
            'scaler': self.scaler,
            'pca': self.pca,
            'ensemble_weights': self.ensemble_weights,
            'is_fitted': self.is_fitted
        }
        
        joblib.dump(model_data, models_path)
        print(f"Models saved to {models_path}")
    
    def load_models(self):
        """Load trained models"""
        models_path = os.path.join(self.model_dir, 'ml_models.joblib')
        
        if not os.path.exists(models_path):
            print("No trained models found, using heuristic mode")
            return False
        
        model_data = joblib.load(models_path)
        
        self.classifiers = model_data['classifiers']
        self.regressors = model_data['regressors']
        self.clustering_models = model_data['clustering']
        self.scaler = model_data['scaler']
        self.pca = model_data['pca']
        self.ensemble_weights = model_data['ensemble_weights']
        self.is_fitted = model_data['is_fitted']
        
        print(f"✅ Models loaded from {models_path}")
        return True
    
    def comprehensive_analysis(self, density_map: np.ndarray, flow_data: Dict, 
                              historical_data: Optional[List] = None) -> Dict:
        """
        Run complete analysis using all ML models
        Returns comprehensive results
        """
        # Extract features
        features = self.extract_comprehensive_features(density_map, flow_data, historical_data)
        
        # Classification
        classification = self.classify_crowd_density(features)
        
        # Regression
        risk_prediction = self.predict_risk_score(features)
        
        # Anomaly detection
        anomaly = self.detect_anomalies(features)
        
        # Combine results
        results = {
            'features': features.tolist(),
            'classification': classification,
            'risk_prediction': risk_prediction,
            'anomaly_detection': anomaly,
            'crowd_density': classification['category'],
            'risk_score': risk_prediction['risk_score'],
            'is_anomalous': anomaly['is_anomaly'],
            'timestamp': str(np.datetime64('now'))
        }
        
        return results


# Import for regression models
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
