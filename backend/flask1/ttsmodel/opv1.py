from flask import current_app
import os
from flask1.ttsmodel.openvoice import se_extractor
from flask1.utils.file_name import generate_audio_filename
from flask1.ttsmodel.models import get_openvoice_models

def generate_speech_with_openvoice(text, reference_audio_path):
    base_speaker_tts, tone_color_converter, source_se, _ = get_openvoice_models()
    aof = current_app.config['AUDIO_OUTPUT_FOLDER']
    procs_dir = current_app.config['PROCESSED_FOLDER']
    os.makedirs(procs_dir, exist_ok=True)
    
    unique_name = generate_audio_filename()
    output_path = os.path.join(aof, unique_name)

    target_se, _ = se_extractor.get_se(reference_audio_path, tone_color_converter, target_dir=procs_dir, vad=True)
    print(f"audio string: {_}")
    #extract_se(...) gives you the target speaker embedding — you store that as target_se
    #audio_name is a string you don’t need — so you ignore it with _                                        
    tmp_path = output_path.replace(".wav", "_tmp.wav")
    
    base_speaker_tts.tts(text, tmp_path, speaker='default', language='English', speed=1.0)

    tone_color_converter.convert(
        audio_src_path=tmp_path,
        src_se=source_se,
        tgt_se=target_se,
        output_path=output_path,
        message="@MyShell"
    )

    return output_path