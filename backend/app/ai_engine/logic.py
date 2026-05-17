from typing import Dict, Any

class AIEngine:
    @staticmethod
    def predict_risks(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Rule-based AI engine for climate-health risk prediction.
        Inputs: rainfall, humidity, temperature, air_quality, stagnant_water, etc.
        """
        temp = data.get("temperature", 25)
        humidity = data.get("humidity", 50)
        rainfall = data.get("rainfall", 0)
        aqi = data.get("air_quality", 50)
        stagnant_water = data.get("stagnant_water_reports", 0)
        overcrowding = data.get("overcrowding_index", 0)

        predictions = {}

        # Malaria Risk
        # IF rainfall high AND humidity high AND stagnant_water_reports > threshold: malaria_risk = HIGH
        if rainfall > 50 and humidity > 70 and stagnant_water > 2:
            predictions["malaria"] = {"level": "CRITICAL", "score": 90, "recommendation": "Mass mosquito net distribution and indoor residual spraying."}
        elif rainfall > 20 and humidity > 60:
            predictions["malaria"] = {"level": "HIGH", "score": 70, "recommendation": "Increase surveillance and clear stagnant water."}
        else:
            predictions["malaria"] = {"level": "MODERATE", "score": 40, "recommendation": "Routine monitoring."}

        # Heat Stress Risk
        # IF temperature > 40: heat_stress = CRITICAL
        if temp > 40:
            predictions["heat_stress"] = {"level": "CRITICAL", "score": 95, "recommendation": "Emergency cooling centers and public health warnings."}
        elif temp > 35:
            predictions["heat_stress"] = {"level": "HIGH", "score": 75, "recommendation": "Hydration advisories and reduced outdoor activity."}
        else:
            predictions["heat_stress"] = {"level": "SAFE", "score": 20, "recommendation": "Normal conditions."}

        # Cholera Risk (Flood + Sanitation)
        if rainfall > 100 or stagnant_water > 5:
            predictions["cholera"] = {"level": "CRITICAL", "score": 85, "recommendation": "Water purification tablets and hygiene kits distribution."}
        else:
            predictions["cholera"] = {"level": "MODERATE", "score": 30, "recommendation": "Monitor water sources."}

        # Respiratory Illness (Air Quality)
        if aqi > 200:
            predictions["respiratory"] = {"level": "CRITICAL", "score": 90, "recommendation": "Public use of N95 masks and indoor confinement."}
        elif aqi > 100:
            predictions["respiratory"] = {"level": "HIGH", "score": 65, "recommendation": "Sensitive groups should stay indoors."}
        else:
            predictions["respiratory"] = {"level": "SAFE", "score": 25, "recommendation": "Good air quality."}

        return predictions

    @staticmethod
    def calculate_safety_score(predictions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compute overall safety score (0-100)
        """
        scores = [p["score"] for p in predictions.values()]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Invert safety: high risk = low safety
        safety_val = 100 - avg_score
        
        if safety_val > 80:
            level = "SAFE"
        elif safety_val > 60:
            level = "MODERATE"
        elif safety_val > 40:
            level = "HIGH RISK"
        else:
            level = "CRITICAL"
            
        return {"score": round(safety_val, 2), "level": level}
