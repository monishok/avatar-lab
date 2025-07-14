import torch
from flask1.lsmodel.models import Wav2Lip

_wav2lip_model = None
_device = 'cuda' if torch.cuda.is_available() else 'cpu'

def _load_checkpoint(path):
    print(f"Loading Wav2Lip checkpoint from: {path}")
    checkpoint = torch.load(path, map_location=_device)
    state_dict = checkpoint['state_dict']
    cleaned_state_dict = {k.replace('module.', ''): v for k, v in state_dict.items()}
    return cleaned_state_dict

def load_model_once(checkpoint_path="./flask1/files/checkpoints/wav2lip_gan.pth"):
    global _wav2lip_model

    if _wav2lip_model is None:
        model = Wav2Lip()
        state_dict = _load_checkpoint(checkpoint_path)
        model.load_state_dict(state_dict, strict=False)
        _wav2lip_model = model.to(_device).eval()
        print("model loaded")
    else:
        print("cached model")

    return _wav2lip_model
