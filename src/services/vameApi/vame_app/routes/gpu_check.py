from flask_restx import Namespace, Resource
import torch

api = Namespace("gpu", description="GPU availability", path="/")


@api.route("/gpu-check")
class GPUCheck(Resource):
    def get(self):
        """
        Check if a GPU is available and return its details.
        Returns:
            dict: A dictionary containing GPU availability and device name.
        """
        has_gpu = False
        device = None

        # Check for CUDA (NVIDIA) GPU
        if torch.cuda.is_available():
            has_gpu = True
            device = torch.cuda.get_device_name(0)
        # Check for MPS (Apple Silicon) GPU
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            has_gpu = True
            device = "Apple MPS (Metal Performance Shaders)"

        return {"has_gpu": has_gpu, "device": device}
