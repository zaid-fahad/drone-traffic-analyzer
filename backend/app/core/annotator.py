import cv2
import numpy as np

class VideoAnnotator:
    def __init__(self):
        self.primary_color = (233, 165, 14)  # Cyan-ish (B, G, R)
        self.text_color = (255, 255, 255)
        self.bg_color = (15, 23, 42)        # Slate Dark

    def draw_dashboard(self, frame, counts, total):
        # Create a semi-transparent overlay in the top-left
        overlay = frame.copy()
        cv2.rectangle(overlay, (20, 20), (260, 160), self.bg_color, -1)
        alpha = 0.7
        cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)

        # Header
        cv2.putText(frame, "TRAFFIC ANALYSIS", (40, 50), 
                    cv2.FONT_HERSHEY_DUPLEX, 0.7, self.primary_color, 2)
        
        # Stats
        cv2.putText(frame, f"Total: {total}", (40, 85), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, self.text_color, 1)
        
        y_offset = 110
        for label, count in counts.items():
            cv2.putText(frame, f"{label.capitalize()}: {count}", (40, y_offset), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
            y_offset += 20

    def draw_tracking(self, frame, box, obj_id, label):
        x1, y1, x2, y2 = map(int, box)
        
        # Draw clean corner-only boxes or thin borders
        cv2.rectangle(frame, (x1, y1), (x2, y2), self.primary_color, 1)
        
        # Label Tag
        tag_text = f"ID:{obj_id} {label.upper()}"
        (w, h), _ = cv2.getTextSize(tag_text, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
        cv2.rectangle(frame, (x1, y1 - 20), (x1 + w + 10, y1), self.primary_color, -1)
        cv2.putText(frame, tag_text, (x1 + 5, y1 - 7), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, self.bg_color, 1, cv2.LINE_AA)

    def draw_counting_line(self, frame, line_y, width):
        # Subtle dashed-style line
        cv2.line(frame, (0, line_y), (width, line_y), (0, 255, 255), 1)
        cv2.putText(frame, "GATE THRESHOLD", (width - 150, line_y - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)

    def draw_bidirectional_dashboard(self, frame, counts):
        # 1. Background Panel
        overlay = frame.copy()
        cv2.rectangle(overlay, (20, 20), (520, 220), self.bg_color, -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)

        # 2. Header
        cv2.putText(frame, "MISSION TELEMETRY - DUAL DIRECTION", (40, 50), 
                    cv2.FONT_HERSHEY_DUPLEX, 0.7, self.primary_color, 2)

        # 3. Directional Sub-Headers
        cv2.putText(frame, "INBOUND (DOWN)", (40, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 100), 2)
        cv2.putText(frame, f"Total: {counts['inbound']['total']}", (40, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.5, self.text_color, 1)
        
        cv2.putText(frame, "OUTBOUND (UP)", (300, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 180, 255), 2)
        cv2.putText(frame, f"Total: {counts['outbound']['total']}", (300, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.5, self.text_color, 1)

        # 4. Dynamic Vehicle Loop
        # We skip 'total' because we already drew it as a header
        vehicle_types = [k for k in counts['inbound'].keys() if k != 'total']
        
        y_offset = 130
        for label in vehicle_types:
            # Draw Inbound stats
            in_val = counts['inbound'].get(label, 0)
            cv2.putText(frame, f"{label.capitalize()}: {in_val}", (40, y_offset), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
            
            # Draw Outbound stats
            out_val = counts['outbound'].get(label, 0)
            cv2.putText(frame, f"{label.capitalize()}: {out_val}", (300, y_offset), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
            
            y_offset += 20 # Step down for next vehicle type