# Light at the end of the tunnel

This is a game created for js13Games 2022 by:
- Håkan Einarsson
- Daivan Trinh
- Pontus Lundström

We used [LittleJS](https://github.com/KilledByAPixel/LittleJS) to create this game, big shoutout to [KilledByAPixel](https://github.com/KilledByAPixel) for the awesome library!

# The idea
Youre in a labyrinth you need to get to the light. It gets darker and darker.
If its completely dark you will die.

# how to run in development mode
`You just need to run the index.html file`

# To ship the game just run
```
npm run dist

# Then zip the dist folder
# You should end up with a dist.zip file
# This will be the file that you use when submitting the game to js13Games


# How to build the 13k Zip
Run engine\build\setupBuild.bat to install the necessary tools via npm
You will need: google-closure-compiler, uglify, roadroller, imagemin-cli, and advzip
Run engine\build\build.bat, to build app.zip which is the final result
It will also create a file called index.min.html you can use for testing
The zip size may vary by 20 bytes or so due to randomness of roadroller