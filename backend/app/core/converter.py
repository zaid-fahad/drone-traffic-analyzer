import subprocess
import os

def convert_to_h264(input_path, output_path):
    """Converts OpenCV output to browser-compatible H.264"""
    try:
        command = [
            'ffmpeg', '-y', 
            '-i', input_path, 
            '-vcodec', 'libx264', 
            '-crf', '24', 
            '-preset', 'veryfast',
            '-pix_fmt', 'yuv420p', 
            '-movflags', '+faststart', 
            output_path
        ]
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        if os.path.exists(input_path):
            os.remove(input_path)
        return True
    except Exception as e:
        print(f"FFmpeg Error: {e}")
        if not os.path.exists(output_path):
            os.rename(input_path, output_path)
        return False