# 🛩️ Custom GLB Models for Sky Warriors

Place your custom 3D models (.glb files) in this folder to use them in the game.

## 📁 Model Files

Place these GLB files in this folder to replace the default models:

- **`player-aircraft.glb`** - Your custom player aircraft model
- **`enemy-tank.glb`** - Your custom tank/enemy model  
- **`tree.glb`** - Your custom tree/vegetation model

## 🎯 Model Requirements

### Aircraft Model:
- **Format**: GLB (preferred) or GLTF
- **Scale**: Models will be automatically scaled (adjust in code if needed)
- **Orientation**: Should face forward along positive X-axis
- **Complexity**: Keep under 10k polygons for good performance

### Tank Model:
- **Format**: GLB (preferred) or GLTF
- **Scale**: Will be scaled to fit gameplay requirements
- **Orientation**: Any orientation (will be positioned on planet surface)
- **Complexity**: Keep under 5k polygons for performance

### Tree Model:
- **Format**: GLB (preferred) or GLTF
- **Scale**: Will be scaled and distributed across planet
- **Complexity**: Keep under 1k polygons (many instances will be created)

## 🔧 Model Optimization Tips

1. **Reduce Polygon Count**: Use tools like Blender to decimate/simplify models
2. **Optimize Textures**: Use compressed textures (1024x1024 or smaller)
3. **Combine Materials**: Fewer materials = better performance
4. **Remove Animations**: Static models perform better
5. **Center Pivot**: Make sure model pivot is centered for proper rotation

## 🎨 Where to Get Models

### Free Resources:
- [Sketchfab](https://sketchfab.com/features/free) - Free CC0 models
- [Poly Haven](https://polyhaven.com/models) - High-quality free models
- [OpenGameArt](https://opengameart.org/) - Game-ready assets
- [Quaternius](https://quaternius.com/) - Low-poly game assets

### Paid Resources:
- [CGTrader](https://www.cgtrader.com/)
- [TurboSquid](https://www.turbosquid.com/)
- [Sketchfab Store](https://sketchfab.com/store)

## 🛠️ Creating Your Own Models

### Blender (Free):
1. Create or import your model
2. Apply all transforms (Ctrl+A > All Transforms)
3. Export as GLB: File > Export > glTF 2.0 (.glb/.gltf)
4. Choose GLB format for single-file export

### Other 3D Software:
- **Maya**: Use Babylon.js exporter or FBX to GLB converter
- **3ds Max**: Use Babylon.js exporter or online converter
- **Cinema 4D**: Export to FBX then convert to GLB

## 🔄 Converting Other Formats

If you have models in other formats (FBX, OBJ, DAE), you can convert them:

### Online Converters:
- [GitHub GLB Converter](https://github.khronos.org/glTF-Sample-Viewer-Release/)
- [FBX to GLB Online](https://www.greentoken.de/onlineconv/)

### Command Line:
```bash
# Using gltf-pipeline (requires Node.js)
npm install -g gltf-pipeline
gltf-pipeline -i model.fbx -o model.glb
```

## 🎮 Testing Your Models

1. Place your GLB files in this `models/` folder
2. Name them according to the requirements above
3. Open `index.html` in your browser
4. Your custom models should load automatically
5. If a model fails to load, the game will use fallback geometry

## 🐛 Troubleshooting

**Model not loading?**
- Check the browser console for error messages
- Ensure file is named correctly
- Try a different model or converter
- Check file size (keep under 10MB)

**Model appears wrong size?**
- Edit the scale value in the game code
- Re-export with different scale from 3D software

**Performance issues?**
- Reduce polygon count
- Optimize textures
- Use fewer materials

## 📝 License Notes

- Ensure you have rights to use any models you download
- Check Creative Commons licenses carefully
- Give attribution where required
- Consider the game's intended use (personal/commercial)

---

Enjoy customizing your Sky Warriors experience! ✈️
