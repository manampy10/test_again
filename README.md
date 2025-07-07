<div align="center">

# OpenClassrooms - Eco-Bliss-Bath

</div>

<p align="center">
    <img src="https://img.shields.io/badge/MariaDB-v11.7.2-blue">
    <img src="https://img.shields.io/badge/Symfony-v6.2-blue">
    <img src="https://img.shields.io/badge/Angular-v13.3.0-blue">
    <img src="https://img.shields.io/badge/docker--build-passing-brightgreen">
  <br><br><br>
</p>

# Prérequis

Pour démarrer cet applicatif web vous devez avoir les outils suivants:

- Docker
- NodeJs

# Installation et démarrage

Clonez le projet pour le récupérer

```
git clone https://github.com/OpenClassrooms-Student-Center/Eco-Bliss-Bath-V2.git
cd Eco-Bliss-Bath-V2
```

Pour démarrer l'API avec ça base de données.

```
docker compose up -d
```

Pour stopper l'API avec ça base de données.

```
docker compose down
```

# Pour démarrer le frontend de l'applicatif

Rendez-vous dans le dossier frontend

```
cd ./frontend
```

Installez les dépendances du projet

```
npm i
ou
npm install (si vous préférez)
```

# Ouvre ton terminal et place-toi dans le dossier frontend/frontend

```
cd frontend/frontend
```

# Installe Cypress

```
npm install cypress --save-dev
```

# Lancer l'interface de test Cypress (mode visuel)

```
npx cypress open
```

# Lancer les tests en ligne de commande (mode CI)

```
npx cypress run
```

# lancement du projet

```
npm start
ng serve --host 0.0.0.0 --port 8080 --disable-host-check
```
