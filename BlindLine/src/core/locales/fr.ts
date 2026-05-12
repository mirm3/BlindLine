export const fr = {
  translation: {
    tabs: {
      home: "Accueil",
      my_trips: "Mes Trajets",
      volunteer: "Bénévole",
      my_volunteering: "Mon Bénévolat",
      profile: "Profil"
    },
    intro: {
      welcome: "Bienvenue",
      description: "Votre compagnon pour un voyage en train accessible en Belgique. Nous connectons les voyageurs malvoyants avec des bénévoles dévoués pour des trajets sûrs et sereins.",
      continue: "Continuer"
    },
    landing: {
      appName: "BlindLine",
      tagline: "Voyagez ensemble, voyagez librement",
      description: "Connecter les voyageurs malvoyants avec des bénévoles pour des trajets en train fluides à travers la Belgique",
      needAssistance: { title: "J'ai besoin d'aide", description: "Trouvez un compagnon bénévole pour vous accompagner lors de votre trajet en train", button: "Demander un trajet" },
      wantToHelp: { title: "Je veux aider", description: "Donnez de votre temps pour accompagner un voyageur malvoyant", button: "Devenir bénévole" },
      howItWorks: {
        title: "Comment ça marche",
        planYourTrip: { title: "Planifiez votre trajet", description: "Entrez votre départ, votre destination et l'heure de voyage préférée" },
        getMatched: { title: "Soyez jumelé", description: "Notre plateforme trouve un bénévole vérifié parcourant le même itinéraire" },
        connectAndConfirm: { title: "Connectez-vous et confirmez", description: "Discutez avec votre partenaire et confirmez le point de rendez-vous" },
        travelTogether: { title: "Voyagez ensemble", description: "Rencontrez-vous à la gare et profitez de votre voyage en toute confiance" }
      },
      partner: { initiative: "Une initiative Markgrave", accessibleTravel: "Travailler ensemble pour un voyage accessible" }
    },
    home: {
      tagline_traveler: "Votre voyage, notre soutien",
      tagline_volunteer: "Faites une différence aujourd'hui",
      needAssistance: {
        title: "J'ai besoin d'aide",
        description: "Trouvez un compagnon bénévole pour vous accompagner lors de votre trajet en train",
        button: "Demander un trajet"
      },
      wantToHelp: {
        title: "Je veux aider",
        description: "Donnez de votre temps pour accompagner un voyageur malvoyant",
        button: "Voir les trajets disponibles"
      }
    },
    profile: {
      title: "Profil",
      user_type: {
        traveler: "Voyageur",
        volunteer: "Bénévole"
      },
      no_email: "Pas d'e-mail",
      sections: {
        info: "Informations sur le profil",
        preferences: "Préférences",
        volunteer: "Profil bénévole"
      },
      fields: {
        email: "E-mail",
        phone: "Téléphone",
        not_set: "Non défini",
        placeholder_email: "Entrez l'e-mail",
        placeholder_phone: "Entrez le numéro de téléphone"
      },
      actions: {
        edit: "Modifier",
        cancel: "Annuler",
        save_changes: "Enregistrer les modifications",
        saving: "Enregistrement...",
        save_preferences: "Enregistrer les préférences",
        save_volunteer: "Enregistrer le profil bénévole",
        logout: "Se déconnecter"
      },
      alerts: {
        saved_title: "Enregistré",
        traveler_msg: "Vos préférences ont été mises à jour.",
        volunteer_msg: "Votre profil bénévole a été mis à jour.",
        error_title: "Erreur",
        error_profile: "Échec de l'enregistrement du profil",
        error_prefs: "Échec de l'enregistrement des préférences",
        error_volunteer: "Échec de l'enregistrement du profil bénévole",
        error_logout: "Échec de la déconnexion"
      },
      volunteer_info: {
        why_title: "Pourquoi c'est important",
        why_text: "Votre profil permet de vous jumeler avec des voyageurs qui ont besoin d'une assistance de dernière minute sans réservation NMBS 24 heures à l'avance. Définissez votre disponibilité et vos gares préférées.",
        motivation_title: "Motivation",
        motivation_hint: "Pourquoi voulez-vous être bénévole ?",
        experience_title: "Expérience",
        experience_hint: "Avez-vous une expérience pertinente ?",
        availability_title: "Fenêtre de disponibilité",
        availability_hint: "ex: Semaine 18:00-21:00",
        routes_title: "Gares préférées",
        routes_hint: "ex: Anvers-Central, Bruxelles-Central",
        languages_title: "Langues parlées",
        languages_hint: "Sélectionnez tout ce qui s'applique",
        assisting_title: "À l'aise pour aider avec",
        assisting_hint: "Sélectionnez tout ce qui s'applique",
        contact_title: "Contact préféré",
        add_window: "Ajouter une fenêtre",
        add_route: "Ajouter un itinéraire",
        close_route: "Fermer",
        add_route_btn: "Ajouter un itinéraire"
      },
      availability_form: {
        day: "Jour",
        from: "De",
        to: "À",
        error_day_title: "Sélectionnez un jour",
        error_day_msg: "Veuillez choisir un jour de la semaine.",
        error_time_title: "Sélectionnez les heures",
        error_time_msg: "Veuillez choisir une heure de début et de fin.",
        error_range_title: "Plage invalide",
        error_range_msg: "L'heure de fin doit être après l'heure de début."
      },
      route_form: {
        from: "De",
        to: "À",
        error_dep_title: "Sélectionnez le départ",
        error_dep_msg: "Veuillez choisir une gare de départ.",
        error_arr_title: "Sélectionnez l'arrivée",
        error_arr_msg: "Veuillez choisir une gare d'arrivée.",
        error_dup_title: "Doublon",
        error_dup_msg: "Cet itinéraire est déjà ajouté."
      },
      days: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
      contact_methods: {
        chat: "Chat intégré",
        phone: "Appel téléphonique",
        sms: "SMS"
      }
    },
    register: {
      title: "Créer un compte",
      subtitle: "Rejoignez la communauté BlindLine",
      back_to_login: "Retour à la connexion",
      user_type_label: "Je m'inscris en tant que :",
      traveler_accessibility: "S'inscrire en tant que voyageur ayant besoin d'aide",
      volunteer_accessibility: "S'inscrire en tant que bénévole pour aider les voyageurs",
      traveler_subtext: "J'ai besoin d'aide",
      volunteer_subtext: "Je veux aider",
      confirm_password: "Confirmer le mot de passe",
      confirm_password_placeholder: "Confirmez votre mot de passe",
      error_user_type: "Veuillez sélectionner un type d'utilisateur.",
      error_required: "Veuillez remplir tous les champs obligatoires.",
      error_password_match: "Les mots de passe ne correspondent pas.",
      error_password_length: "Le mot de passe doit comporter au moins 6 caractères.",
      error_failed: "Échec de l'inscription",
      success_title: "Compte créé",
      success_msg: "Votre compte a été créé avec succès !",
      terms_prefix: "En vous inscrivant, vous acceptez nos",
      terms_link: "Conditions d'utilisation",
      terms_and: "et notre",
      privacy_link: "Politique de confidentialité",
      button: "Créer un compte",
      button_loading: "Création du compte..."
    },
    onboarding_language: {
      progress: "Étape 4 sur 4",
      question: "Quelle est votre langue préférée ?",
      options: {
        dutch: "Néerlandais",
        english: "Anglais",
        french: "Français",
        polish: "Polonais",
        turkish: "Turc",
        skip: "Passer"
      },
      completeButton: "Terminer",
      savingButton: "Enregistrement...",
      error: "Échec de l'enregistrement du profil"
    },
    request_trip: {
      header: "Demander un trajet",
      subtitle: "Dites-nous où vous voulez aller et nous trouverons un bénévole pour vous accompagner",
      labels: {
        departure: "Gare de départ",
        arrival: "Gare d'arrivée",
        date: "Date de départ",
        time: "Heure de départ"
      },
      placeholders: {
        departure: "Sélectionnez la gare de départ",
        arrival: "Sélectionnez la gare d'arrivée"
      },
      validation: {
        error_dep: "Veuillez sélectionner une gare de départ",
        error_arr: "Veuillez sélectionner une gare d'arrivée",
        error_same: "Les gares de départ et d'arrivée ne peuvent pas être les mêmes",
        error_future: "Veuillez sélectionner une date et une heure futures"
      },
      alerts: {
        success_title: "Trajet demandé !",
        success_msg: "Votre demande de trajet a été soumise. Nous vous informerons lorsqu'un bénévole sera jumelé.",
        error_title: "Erreur",
        error_msg: "Échec de la création de la demande de trajet. Veuillez réessayer."
      },
      button: "Demander le trajet",
      next_steps: {
        title: "Que se passe-t-il ensuite ?",
        step1: "Votre demande sera visible par tous les bénévoles disponibles",
        step2: "Un bénévole parcourant un itinéraire similaire proposera son aide",
        step3: "Vous serez informé et pourrez voir votre partenaire dans \"Mes Trajets\""
      }
    },
    login: {
      welcome: "Bon retour",
      signInContinue: "Connectez-vous pour continuer votre voyage",
      emailLabel: "E-mail",
      emailPlaceholder: "Entrez votre e-mail",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Entrez votre mot de passe",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe",
      errorFillFields: "Veuillez remplir tous les champs.",
      errorLoginFailed: "Échec de la connexion",
      forgotPassword: "Mot de passe oublié ?",
      signInButton: "Se connecter",
      signingInButton: "Connexion...",
      noAccount: "Vous n'avez pas de compte ?",
      signUpLink: "S'inscrire"
    },
    welcome: {
      title: "Bienvenue sur BlindLine !",
      description: "Configurons votre profil afin de vous jumeler avec les meilleurs bénévoles pour vos trajets en train.",
      subtitle: "Nous allons vous poser 4 questions rapides sur vos besoins et préférences.",
      button: "Commencer"
    },
    onboarding_vision: {
      progress: "Étape 1 sur 4",
      question: "Quel type de déficience visuelle avez-vous ?",
      options: {
        completely_blind: "Totalement aveugle",
        low_vision: "Malvoyant",
        skip: "Je préfère ne pas le dire"
      },
      nextButton: "Suivant"
    },
    onboarding_mobility: {
      progress: "Étape 2 sur 4",
      question: "Utilisez-vous des aides à la mobilité ?",
      hint: "Sélectionnez tout ce qui s'applique",
      options: {
        white_cane: "Canne blanche",
        guide_dog: "Chien guide",
        wheelchair: "Fauteuil roulant",
        skip: "Passer"
      },
      nextButton: "Suivant"
    },
    onboarding_assistance: {
      progress: "Étape 3 sur 4",
      question: "De quelle assistance avez-vous besoin pendant le voyage ?",
      hint: "Sélectionnez tout ce qui s'applique",
      options: {
        finding_platform: "Trouver le quai",
        boarding_train: "Monter dans le train",
        finding_seat: "Trouver un siège",
        guidance_station: "Guidage dans la gare",
        announcements: "Aide avec les annonces"
      },
      nextButton: "Suivant"
    },
    volunteer_home: {
      loading_trips: "Chargement des trajets disponibles...",
      availability: {
        available: "Vous êtes disponible !",
        set_available: "Se rendre disponible",
        showing_trips: "Affichage des trajets disponibles",
        turn_on: "Activez pour voir les demandes de trajet",
        alert_available_title: "Vous êtes disponible !",
        alert_available_msg: "Vous êtes maintenant disponible pour aider les voyageurs. Consultez les trajets !",
        alert_unavailable_title: "Statut mis à jour",
        alert_unavailable_msg: "Vous n'êtes plus disponible. Vous ne verrez plus de nouvelles demandes.",
        error_update: "Échec de la mise à jour de la disponibilité"
      },
      header: {
        title: "Aider un voyageur",
        subtitle: "Parcourez les demandes de trajets des voyageurs malvoyants ayant besoin d'un compagnon"
      },
      stats: {
        available_trips: "Trajets disponibles"
      },
      trips_section: {
        title: "Trajets nécessitant de l'aide",
        from: "De",
        to: "À",
        traveler_needs: "Le voyageur a besoin d'aide",
        offer_button: "Proposer d'aider",
        time_in_days: "dans {{count}} jour",
        time_in_days_plural: "dans {{count}} jours",
        time_in_hours: "dans {{count}} heure",
        time_in_hours_plural: "dans {{count}} heures",
        time_soon: "Bientôt"
      },
      offer_help: {
        alert_title: "Proposer de l'aide",
        alert_msg: "Souhaitez-vous accompagner le voyageur de {{departure}} à {{arrival}} ?",
        cancel: "Annuler",
        confirm: "Oui, j'aide",
        success_title: "Succès !",
        success_msg: "Vous avez été jumelé avec le voyageur. Consultez \"Mes Trajets\" pour les détails.",
        error_offer: "Échec de la proposition d'aide"
      },
      empty_state: {
        not_available_title: "Vous n'êtes pas disponible",
        not_available_msg: "Activez l'interrupteur de disponibilité ci-dessus pour commencer à voir et aider les voyageurs.",
        no_trips_title: "Aucun trajet disponible",
        no_trips_msg: "Tous les voyageurs ont actuellement des compagnons. Revenez plus tard ou tirez vers le bas pour rafraîchir."
      },
      tips: {
        title: "Conseils pour les bénévoles",
        tip1: "Rendez-vous au point de rencontre 10 minutes à l'avance",
        tip2: "Proposez votre coude au voyageur pour qu'il puisse le tenir",
        tip3: "Décrivez l'environnement et les obstacles éventuels"
      }
    },
    volunteer_trips: {
      loading: "Chargement de vos trajets...",
      mobility_labels: {
        white_cane: "Canne blanche",
        guide_dog: "Chien guide",
        wheelchair: "Fauteuil roulant"
      },
      assistance_labels: {
        finding_platform: "Trouver le quai",
        boarding_train: "Monter dans le train",
        finding_seat: "Trouver un siège",
        guidance_station: "Guidage gare",
        announcements: "Annonces"
      },
      status: {
        pending: "En attente de votre réponse",
        matched: "Jumelé",
        completed: "Terminé",
        canceled: "Annulé",
        unknown: "Inconnu"
      },
      sections: {
        pending: "Demandes en attente",
        active: "Engagements actifs",
        past: "Trajets passés"
      },
      labels: {
        from: "De",
        to: "À",
        needs_help: "Le voyageur a besoin de votre aide",
        helping: "Vous aidez",
        helped: "Vous avez aidé",
        needs_prefix: "Besoins : "
      },
      actions: {
        accept: "Accepter",
        decline: "Refuser",
        complete: "Terminer le trajet",
        cancel: "Annuler"
      },
      alerts: {
        accept_title: "Accepter le trajet",
        accept_msg: "Accepter d'aider pour le trajet de {{departure}} à {{arrival}} ?",
        accept_success_title: "Accepté !",
        accept_success_msg: "Vous avez confirmé ce trajet. Le voyageur en sera informé.",
        decline_title: "Refuser le trajet",
        decline_msg: "Êtes-vous sûr ? Le système tentera de trouver un autre bénévole.",
        decline_success_title: "Refusé",
        decline_success_msg: "Le trajet a été refusé.",
        cancel_title: "Annuler l'assistance",
        cancel_msg: "Êtes-vous sûr de vouloir annuler votre proposition d'aide ?",
        cancel_success_title: "Annulé",
        cancel_success_msg: "Votre proposition a été annulée.",
        complete_title: "Terminer le trajet",
        complete_msg: "Marquer ce trajet comme terminé ?",
        complete_success_title: "Trajet terminé",
        complete_success_msg: "Merci pour votre aide ! Votre assistance fait une réelle différence."
      },
      empty: {
        no_active: "Aucun trajet actif",
        no_active_hint_pending: "Acceptez une demande en attente ci-dessus pour commencer",
        no_active_hint_none: "Parcourez les trajets disponibles pour proposer votre aide",
        no_past: "Aucun trajet passé pour le moment"
      },
      impact: {
        title: "Votre Impact",
        trips_completed: "Trajets terminés",
        thank_you: "Merci !"
      }
    },
    reviews: {
      title_volunteer: "Évaluer le bénévole",
      title_traveler: "Évaluer le voyageur",
      success_title: "Succès",
      success_msg: "Merci pour votre avis !"
    },
    location_sharing: {
      screen_title: "Localisation du voyageur",
      share_label: "Partager ma position",
      sharing_active: "Actif",
      permission_denied_title: "Permission refusée",
      permission_denied_msg: "L'autorisation de localisation est requise pour partager votre position.",
      waiting: "En attente de la position du voyageur...",
      last_updated: "Dernière mise à jour",
      seconds_ago: "il y a {{count}}s",
      track_button: "Suivre le voyageur"
    },
    phone_call: {
      call_volunteer: "Appeler le bénévole",
      call_traveler: "Appeler le voyageur",
      no_phone_title: "Pas de numéro de téléphone",
      no_phone_msg: "Cet utilisateur n'a pas partagé de numéro de téléphone."
    },
    traveler_trips: {
      loading: "Chargement de vos trajets...",
      plan_new_trip: "Planifier un nouveau trajet",
      sections: {
        upcoming: "Trajets à venir",
        past: "Trajets passés"
      },
      status: {
        matched: "Jumelé",
        pending: "En attente",
        completed: "Terminé",
        canceled: "Annulé",
        waiting: "En attente d'un bénévole..."
      },
      labels: {
        traveling_with: "Voyage avec",
        traveled_with: "A voyagé avec"
      },
      actions: {
        cancel_trip: "Annuler le trajet"
      },
      alerts: {
        cancel_title: "Annuler le trajet",
        cancel_msg: "Êtes-vous sûr de vouloir annuler cette demande de trajet ?",
        cancel_success_title: "Annulé",
        cancel_success_msg: "Votre trajet a été annulé.",
        error_cancel: "Échec de l'annulation"
      },
      empty: {
        no_upcoming: "Aucun trajet à venir",
        no_upcoming_hint: "Appuyez sur \"Planifier un nouveau trajet\" pour commencer",
        no_past: "Aucun trajet passé"
      }
    }
  }
};
