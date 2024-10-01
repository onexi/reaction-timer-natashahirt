[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](x)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=15932100)
Starter Code for Reaction Timer 
Run npm install to install all dependencies 
The above uses package.json to build the project
Note .gitignore is set to ignore node_modules

Hello! This is my take on the reaction timer. 

This allows a user to input their name and test their reaction time against friends. I played with a similar test
(just using it, not making) in elementary school and my teacher really instilled in us that we should always take the
average of our reaction times over 5-10 attempts because there's so much variance. Hence, this site takes 10 attempts, 
averages them, and then records the average on the leaderboard next to your name. If you play the game more than once,
all of your attempts will be seperately recorded in the leaderboard. Should you wish to pass off the game to someone 
else, after the end of the game you have the option of picking a new player or staying as yourself. Finally, my solution
to preventing cheating takes the form of "strikes". If you make three invalid clicks, the game saves your average as it
was up to that point, and restarts. Three strikes and you're out!