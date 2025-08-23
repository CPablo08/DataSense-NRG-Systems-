#!/usr/bin/env python3
"""
Create NRG DataSense App Icon
Generates a proper app icon for the desktop application
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_app_icon():
    """Create a professional app icon"""
    
    # Create a 256x256 image (high resolution for all platforms)
    size = 256
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Define colors
    primary_color = (52, 152, 219)    # Blue
    secondary_color = (41, 128, 185)  # Darker blue
    accent_color = (46, 204, 113)     # Green
    white = (255, 255, 255)
    black = (44, 62, 80)
    
    # Draw background circle
    center = size // 2
    radius = size // 2 - 10
    draw.ellipse([center - radius, center - radius, center + radius, center + radius], 
                 fill=primary_color, outline=secondary_color, width=3)
    
    # Draw inner circle for data representation
    inner_radius = radius - 30
    draw.ellipse([center - inner_radius, center - inner_radius, center + inner_radius, center + inner_radius], 
                 fill=white, outline=secondary_color, width=2)
    
    # Draw data lines (representing meteorological data)
    line_length = inner_radius - 20
    line_spacing = 15
    start_y = center - (line_length // 2)
    
    for i in range(5):
        y = start_y + (i * line_spacing)
        # Create a wavy line to represent data
        points = []
        for x in range(-line_length//2, line_length//2, 5):
            wave = 5 * (i % 2) * (1 if i < 3 else -1)  # Alternating wave pattern
            points.append((center + x, y + wave))
        
        if points:
            draw.line(points, fill=accent_color, width=3)
    
    # Draw a small weather icon in the center
    weather_radius = 25
    draw.ellipse([center - weather_radius, center - weather_radius, 
                  center + weather_radius, center + weather_radius], 
                 fill=accent_color, outline=white, width=2)
    
    # Draw wind lines
    wind_start_x = center - weather_radius + 5
    wind_end_x = center + weather_radius - 5
    for i in range(3):
        y_offset = -10 + (i * 10)
        draw.line([(wind_start_x, center + y_offset), (wind_end_x, center + y_offset)], 
                 fill=white, width=2)
    
    # Save the icon
    icon_path = "app_icon.png"
    image.save(icon_path, "PNG")
    print(f"App icon created: {icon_path}")
    
    # Create smaller versions for different uses
    sizes = [64, 32, 16]
    for small_size in sizes:
        small_image = image.resize((small_size, small_size), Image.Resampling.LANCZOS)
        small_path = f"app_icon_{small_size}.png"
        small_image.save(small_path, "PNG")
        print(f"Small icon created: {small_path}")
    
    return icon_path

if __name__ == "__main__":
    create_app_icon()
