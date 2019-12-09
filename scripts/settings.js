var defaultSettings = JSON.parse(`
{
  "preset": "Default",
  "closed": false,
  "remembered": {
    "Default": {
      "0": {
        "vertexShader": 0,
        "fragmentShader": 0,
        "displayColor": true
      },
      "1": {
        "isLit": true,
        "ambient": [25.5, 25.5, 102],
        "diffusal": [38.25, 38.25, 153],
        "specular": [63.75, 63.75, 255]
      },
      "2": {
        "isLit": true,
        "x": 6.0,
        "y": 5.0,
        "z": 5.0,
        "ambient": [102, 102, 102],
        "diffusal": [255, 255, 255],
        "specular": [255, 255, 255]
      },
      "3": {
        "isLit": true,
        "x": -3.0,
        "y": -5.0,
        "z": -2.0,
        "ambient": [51, 51, 38.25],
        "diffusal": [191.25, 191.25, 127.5],
        "specular": [204, 204, 153]
      }
    }
  },
  "folders": {
    "Rendering": {
      "preset": "Default",
      "closed": false,
      "folders": {}
    },
    "HeadLight": {
      "preset": "Default",
      "closed": true,
      "folders": {}
    },
    "Light #1": {
      "preset": "Default",
      "closed": true,
      "folders": {}
    },
    "Light #2": {
      "preset": "Default",
      "closed": true,
      "folders": {}
    }
  }
}`);