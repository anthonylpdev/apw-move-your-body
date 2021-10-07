# Antho parle web - Creative Contest - Move your body - By Bruno Simon

![APW for Three.js](apw.png)

## Installation
Run this command in the terminal to install dependencies :
```
yarn
```
Compile the code with a local server (during dev).
```
yarn dev
```

## Participation

Initialement, ce projet était une expérimentation basée sur [cette oeuvre](https://rarible.com/token/0xd07dc4262bcdbf85190c01c996b4c06a461d2430:300573:0xbcfba32709f59838121c0007dc1ca6e8b7432011?tab=owners)

La sphère devait être animée de façon aléatoire, mais cela manquait d'interaction. J'ai donc décidé d'utiliser le micro pour modifier les différents paramètres de la forme et, au même moment, j'ai eu vent du concours. J'ai donc décidé d'orienté mon experience dans cette direction.

La sphère est une simple géométrie avec un nombre très élevé de subdivision (qui explique les performances un peu limites).

Les ondulations sont gérées dans un vertex shader avec une combinaison de perlin qui rapproche ou éloigne la vertice de sa position d'origine.

La principale difficulté était de gérer les normales. Les normales de bases sont orientées vers l'extérieur de la sphère sauf qu'avec les ondulations, ce n'est plus le cas. Il a été nécessaire de calculer chaque normal "computed" par rapport aux normales voisines avec un produit en croix (cross product).
