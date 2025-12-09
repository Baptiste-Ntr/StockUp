# StockUp
StockUp est une application de gestion de boutique pour les clubs, intégrée à l'écosystème Lynup. Elle permet aux responsables de clubs de gérer facilement leur inventaire, leurs stocks et leurs ventes de produits (merchandising, matériel, etc.).

## ✨ Fonctionnalités principales
### Gestion d'inventaire
Ajout, modification et suppression de produits avec détails (nom, prix, quantité, catégorie).

### Suivi des stocks en temps réel
Visualisation immédiate des niveaux de stock et des alertes si les quantités baissent.

### Historique des ventes
Journal complet des transactions, permettant de suivre les ventes et les mouvements de stock.

### Intégration Lynup (a venir)
Connexion fluide à la plateforme Lynup pour synchroniser les données et gérer le club de manière centralisée.

## 🧪 Version alpha (stockage local)
Actuellement, la version alpha de StockUp utilise un stockage local (localStorage du navigateur) pour les données. Cela signifie :

- Les données sont conservées dans votre navigateur sur cet appareil uniquement.
- Aucune synchronisation serveur pour le moment.
- Parfait pour tester les fonctionnalités en isolation.

La synchronisation avec Lynup et le stockage sur serveur seront intégrés dans les prochaines versions.

## 🔐 Sécurité & données
Actuellement (phase alpha) :

- Les données sont stockées localement dans le navigateur (localStorage).
- Aucune donnée n'est transmise à un serveur pour le moment.
- Les données ne sont pas chiffrées ni synchronisées.

Avant le passage en production, une authentification sécurisée via Lynup et un stockage serveur seront mis en place.

## 🗺️ Roadmap
- ✅ Gestion basique d'inventaire (alpha local).

- 🔄 Synchronisation avec Lynup (prochaine version).

- 🔄 Stockage persistant sur serveur.

- 🔄 Multi-compte (plusieurs clubs).

- 🔄 Rapports et statistiques avancées.

- 🔄 Application mobile (React Native / Expo).

## 👤 Développé pour l'écosystème Lynup
StockUp fait partie de l'écosystème Lynup, une plateforme intégrée pour la gestion de clubs. Pour plus d'informations sur Lynup et les autres outils :

## 📝 Support & Questions
Pour toute question, suggestion ou bug report :

- Ouvre une issue sur le repository GitHub : https://github.com/Baptiste-Ntr/StockUp/issues
- Ou contacte l'équipe Lynup directement.
