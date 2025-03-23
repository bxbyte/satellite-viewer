# Satellite Viewer

Little project that display ECI coordinates based on 2LE data from both the [Celestrak](https://celestrak.org) and [TLE-API](https://tle.ivanstanojevic.me) APIs.

This is a little project made for a class at the [IUT2](https://iut2.univ-grenoble-alpes.fr) of the [University of Grenoble Alpes](https://www.univ-grenoble-alpes.fr/).

## Repositery structure

This project was made in full vanilla JS and should be compatible with most modern-day browsers (at least as of 23/03/2025).

```
.
├── ...                            
├── celestrak-pipe.mjs                      # Script running on deploy
└── web
    ├── ...
    ├── cache-sw.mjs                        # Cache service worker
    ├── data
    │   └── satellites.bin                  # Default satellites params
    └── scripts
        ├── api
        │   ├── ...
        │   ├── api.mjs                     # API common "interface"
        │   └── sources
        │       ├── celestrak.mjs           # Celestrak API implementations
        │       └── tle-api.mjs             # TLE-API API implementation
        ├── bookmark.mjs                    # Bookmark implementation
        ├── satellite.mjs                   # Satellite implementation
        ├── cache.mjs                       # Cache worker entrypoint
        ├── canvas
        │   ├── ...
        │   ├── scene-controls.mjs          # Scene controllers
        │   ├── scene.mjs                   # Scene renderer
        │   ├── matrix.mjs                  # Matrix model implementations
        │   ├── shader-program.mjs          # Shader model implementations
        │   └── shaders                     # Shader programs' codes
        │       └── ...
        └── explore
            ├── ...
            ├── api-handler.mjs             # API form handler
            ├── bookmark-handler.mjs        # Bookmark form handler
            ├── explore-handler.mjs         # Explore form handler
            └── fields.mjs                  # Generated fields implementation
```

### Note on `celestrak-pipe.mjs` & `web/data/satellites.bin`

The script `celestrak-pipe.mjs` is run on each deploy with Github Page to get and transform TLEs into binary in `data/satellites.bin`, that file being used to load and display default satellites.