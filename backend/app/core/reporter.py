import pandas as pd
import os

def generate_csv_report(history, job_id, result_dir, duration):
    df = pd.DataFrame(history)
    report_path = os.path.join(result_dir, f"{job_id}_report.csv")
    
    # Add metadata as header or separate rows if needed
    # For simplicity, we save the detection log
    df.to_csv(report_path, index=False)
    return report_path