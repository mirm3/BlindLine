export const en = {
  translation: {
    common: {
      return: "Return",
      back: "Back"
    },
    tabs: {
      home: "Home",
      my_trips: "My Trips",
      volunteer: "Volunteer",
      my_volunteering: "My Volunteering",
      profile: "Profile"
    },
    intro: {
      welcome: "Welcome",
      description: "Your companion for accessible train travel in Belgium. We connect visually impaired travelers with dedicated volunteers for safe, confident journeys.",
      continue: "Continue"
    },
    landing: {
      appName: "BlindLine",
      tagline: "Travel together, travel freely",
      description: "Connecting visually impaired travelers with volunteers for seamless train journeys across Belgium",
      needAssistance: { title: "I Need Assistance", description: "Find a volunteer companion to travel with you on your train journey", button: "Request a Trip" },
      wantToHelp: { title: "I Want to Help", description: "Volunteer your time to accompany a visually impaired traveler", button: "Become a Volunteer" },
      howItWorks: {
        title: "How It Works",
        planYourTrip: { title: "Plan Your Trip", description: "Enter your departure, destination, and preferred travel time" },
        getMatched: { title: "Get Matched", description: "Our platform finds a verified volunteer traveling the same route" },
        connectAndConfirm: { title: "Connect & Confirm", description: "Chat with your match and confirm the meeting point" },
        travelTogether: { title: "Travel Together", description: "Meet at the station and enjoy your journey with confidence" }
      },
      partner: { initiative: "A Markgrave Initiative", accessibleTravel: "Working together for accessible travel" }
    },
    home: {
      tagline_traveler: "Your journey, our support",
      tagline_volunteer: "Make a difference today",
      needAssistance: {
        title: "I Need Assistance",
        description: "Find a volunteer companion to travel with you on your train journey",
        button: "Request a Trip"
      },
      wantToHelp: {
        title: "I Want to Help",
        description: "Volunteer your time to accompany a visually impaired traveler",
        button: "View Available Trips"
      }
    },
    profile: {
      title: "Profile",
      user_type: {
        traveler: "Traveler",
        volunteer: "Volunteer"
      },
      no_email: "No email",
      sections: {
        info: "Profile Information",
        preferences: "Preferences",
        volunteer: "Volunteer Profile"
      },
      fields: {
        email: "Email",
        phone: "Phone",
        not_set: "Not set",
        placeholder_email: "Enter email",
        placeholder_phone: "Enter phone number"
      },
      actions: {
        edit: "Edit",
        cancel: "Cancel",
        save_changes: "Save Changes",
        saving: "Saving...",
        save_preferences: "Save Preferences",
        save_volunteer: "Save Volunteer Profile",
        logout: "Log Out"
      },
      alerts: {
        saved_title: "Saved",
        traveler_msg: "Your preferences have been updated.",
        volunteer_msg: "Your volunteer profile has been updated.",
        error_title: "Error",
        error_profile: "Failed to save profile",
        error_prefs: "Failed to save preferences",
        error_volunteer: "Failed to save volunteer profile",
        error_logout: "Failed to log out"
      },
      volunteer_info: {
        why_title: "Why this matters",
        why_text: "Your profile helps match you with travelers who need last-minute assistance without NMBS 24-hour reservations. Set your availability and preferred stations so we can find the right trips for you.",
        motivation_title: "Motivation",
        motivation_hint: "Why do you want to volunteer?",
        experience_title: "Experience",
        experience_hint: "Any relevant experience?",
        availability_title: "Availability window",
        availability_hint: "e.g., Weekdays 18:00-21:00",
        routes_title: "Preferred stations",
        routes_hint: "e.g., Antwerp-Central, Brussels-Central",
        languages_title: "Languages you speak",
        languages_hint: "Select all that apply",
        assisting_title: "Comfortable assisting with",
        assisting_hint: "Select all that apply",
        contact_title: "Preferred contact",
        add_window: "Add Window",
        add_route: "Add a route",
        close_route: "Close",
        add_route_btn: "Add Route"
      },
      availability_form: {
        day: "Day",
        from: "From",
        to: "To",
        error_day_title: "Select a day",
        error_day_msg: "Please pick a day of the week.",
        error_time_title: "Select times",
        error_time_msg: "Please pick a start and end time.",
        error_range_title: "Invalid range",
        error_range_msg: "End time must be after start time."
      },
      route_form: {
        from: "From",
        to: "To",
        error_dep_title: "Select departure",
        error_dep_msg: "Please pick a departure station.",
        error_arr_title: "Select arrival",
        error_arr_msg: "Please pick an arrival station.",
        error_dup_title: "Duplicate",
        error_dup_msg: "This route is already added."
      },
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      contact_methods: {
        chat: "In-app chat",
        phone: "Phone call",
        sms: "SMS"
      }
    },
    register: {
      title: "Create Account",
      subtitle: "Join the BlindLine community",
      back_to_login: "Go back to login",
      user_type_label: "I am registering as:",
      traveler_accessibility: "Register as a traveler who needs assistance",
      volunteer_accessibility: "Register as a volunteer to help travelers",
      traveler_subtext: "I need assistance",
      volunteer_subtext: "I want to help",
      confirm_password: "Confirm Password",
      confirm_password_placeholder: "Confirm your password",
      error_user_type: "Please select a user type.",
      error_required: "Please fill in all required fields.",
      error_password_match: "Passwords do not match.",
      error_password_length: "Password must be at least 6 characters.",
      error_failed: "Registration failed",
      success_title: "Account Created",
      success_msg: "Your account has been created successfully!",
      terms_prefix: "By registering, you agree to our",
      terms_link: "Terms of Service",
      terms_and: "and",
      privacy_link: "Privacy Policy",
      button: "Create Account",
      button_loading: "Creating Account..."
    },
    onboarding_language: {
      progress: "Step 4 of 4",
      question: "What is your preferred language?",
      options: {
        dutch: "Dutch",
        english: "English",
        french: "French",
        polish: "Polish",
        turkish: "Turkish",
        skip: "Skip"
      },
      completeButton: "Complete",
      savingButton: "Saving...",
      error: "Failed to save profile"
    },
    request_trip: {
      header: "Request a Trip",
      subtitle: "Tell us where you want to go and we'll find a volunteer to accompany you",
      labels: {
        departure: "Departure Station",
        arrival: "Arrival Station",
        date: "Departure Date",
        time: "Departure Time"
      },
      placeholders: {
        departure: "Select departure station",
        arrival: "Select arrival station"
      },
      validation: {
        error_dep: "Please select a departure station",
        error_arr: "Please select an arrival station",
        error_same: "Departure and arrival stations cannot be the same",
        error_future: "Please select a future date and time"
      },
      alerts: {
        success_title: "Trip Requested!",
        success_msg: "Your trip request has been submitted. We will notify you when a volunteer is matched.",
        error_title: "Error",
        error_msg: "Failed to create trip request. Please try again."
      },
      button: "Request Trip",
      next_steps: {
        title: "What happens next?",
        step1: "Your request will be visible to all available volunteers",
        step2: "A volunteer traveling a similar route will offer to help",
        step3: "You'll be notified and can view your match in \"My Trips\""
      }
    },
    login: {
      welcome: "Welcome Back",
      signInContinue: "Sign in to continue your journey",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      errorFillFields: "Please fill in all fields.",
      errorLoginFailed: "Login failed",
      errorInvalidCredentials: "Invalid email or password.",
      errorUserNotFound: "No account found with this email.",
      forgotPassword: "Forgot Password?",
      signInButton: "Sign In",
      signingInButton: "Signing in...",
      noAccount: "Don't have an account?",
      signUpLink: "Sign Up"
    },
    welcome: {
      title: "Welcome to BlindLine!",
      description: "Let's set up your profile so we can match you with the best volunteers for your train journeys.",
      subtitle: "We'll ask you 4 quick questions about your needs and preferences.",
      button: "Get Started"
    },
    onboarding_vision: {
      progress: "Step 1 of 4",
      question: "What type of visual impairment do you have?",
      options: {
        completely_blind: "Completely blind",
        low_vision: "Low vision",
        skip: "Prefer not to say"
      },
      nextButton: "Next"
    },
    onboarding_mobility: {
      progress: "Step 2 of 4",
      question: "Do you use any mobility aids?",
      hint: "",
      options: {
        yes: "Yes",
        no: "No",
        skip: "Skip"
      },
      nextButton: "Next"
    },
    onboarding_assistance: {
      progress: "Step 3 of 4",
      question: "What assistance do you need during travel?",
      hint: "Select all that apply",
      options: {
        finding_platform: "Finding the platform",
        boarding_train: "Boarding the train",
        finding_seat: "Finding a seat",
        guidance_station: "Guidance inside station",
        announcements: "Assistance with announcements"
      },
      nextButton: "Next"
    },
    onboarding_volunteer: {
      title: "Welcome, Volunteer!",
      description: "To start helping travelers, you need to complete your volunteer profile. This helps us match you with the right people at the right time.",
      subtitle: "You'll need to provide your motivation, availability, and preferred stations.",
      button: "Complete Profile",
      skip: "I'll do it later"
    },
    volunteer_home: {
      loading_trips: "Loading available trips...",
      availability: {
        available: "You're Available!",
        set_available: "Set Available",
        showing_trips: "Showing available trips",
        turn_on: "Turn on to see trip requests",
        alert_available_title: "You're Available!",
        alert_available_msg: "You are now available to help travelers. Check for available trips!",
        alert_unavailable_title: "Status Updated",
        alert_unavailable_msg: "You are no longer available. You won't see new trip requests.",
        error_update: "Failed to update availability"
      },
      header: {
        title: "Help a Traveler",
        subtitle: "Browse trip requests from visually impaired travelers who need a companion"
      },
      stats: {
        available_trips: "Available Trips"
      },
      trips_section: {
        title: "Trips Needing Help",
        from: "From",
        to: "To",
        traveler_needs: "Traveler needs assistance",
        offer_button: "Offer to Help",
        time_in_days: "in {{count}} day",
        time_in_days_plural: "in {{count}} days",
        time_in_hours: "in {{count}} hour",
        time_in_hours_plural: "in {{count}} hours",
        time_soon: "Soon"
      },
      offer_help: {
        alert_title: "Offer Help",
        alert_msg: "Would you like to accompany the traveler from {{departure}} to {{arrival}}?",
        cancel: "Cancel",
        confirm: "Yes, I'll Help",
        success_title: "Success!",
        success_msg: "You have been matched with the traveler. Check \"My Trips\" for details.",
        error_offer: "Failed to offer help"
      },
      empty_state: {
        not_available_title: "You're Not Available",
        not_available_msg: "Toggle the availability switch above to start seeing and helping travelers.",
        no_trips_title: "No Trips Available",
        no_trips_msg: "All travelers currently have companions. Check back later or pull down to refresh."
      },
      tips: {
        title: "Volunteer Tips",
        tip1: "Meet at the designated meeting point 10 minutes early",
        tip2: "Offer your elbow for the traveler to hold",
        tip3: "Describe the surroundings and any obstacles"
      }
    },
    volunteer_trips: {
      loading: "Loading your trips...",
      mobility_labels: {
        yes: "Mobility aids",
        no: "No mobility aids"
      },
      assistance_labels: {
        finding_platform: "Finding platform",
        boarding_train: "Boarding train",
        finding_seat: "Finding a seat",
        guidance_station: "Station guidance",
        announcements: "Announcements"
      },
      status: {
        pending: "Awaiting Your Response",
        matched: "Matched",
        completed: "Completed",
        canceled: "Canceled",
        unknown: "Unknown"
      },
      sections: {
        pending: "Pending Requests",
        active: "Active Commitments",
        past: "Past Trips"
      },
      labels: {
        from: "From",
        to: "To",
        needs_help: "Traveler needs your help",
        helping: "You are helping",
        helped: "You helped",
        needs_prefix: "Needs: "
      },
      actions: {
        accept: "Accept",
        decline: "Decline",
        complete: "Complete Trip",
        cancel: "Cancel"
      },
      alerts: {
        accept_title: "Accept Trip",
        accept_msg: "Accept to help with the trip from {{departure}} to {{arrival}}?",
        accept_success_title: "Accepted!",
        accept_success_msg: "You have confirmed this trip. The traveler will be notified.",
        decline_title: "Decline Trip",
        decline_msg: "Are you sure? The system will try to find another volunteer for this traveler.",
        decline_success_title: "Declined",
        decline_success_msg: "The trip has been declined.",
        cancel_title: "Cancel Assistance",
        cancel_msg: "Are you sure you want to cancel your offer to help with this trip?",
        cancel_success_title: "Cancelled",
        cancel_success_msg: "Your offer has been cancelled.",
        complete_title: "Complete Trip",
        complete_msg: "Mark this trip as completed?",
        complete_success_title: "Trip Completed",
        complete_success_msg: "Thank you for helping! Your assistance makes a real difference."
      },
      empty: {
        no_active: "No active trips",
        no_active_hint_pending: "Accept a pending request above to get started",
        no_active_hint_none: "Browse available trips to offer your help",
        no_past: "No past trips yet"
      },
      impact: {
        title: "Your Impact",
        trips_completed: "Trips Completed",
        thank_you: "Thank You!"
      }
    },
    reviews: {
      title_volunteer: "Review Volunteer",
      title_traveler: "Review Traveler",
      edit_review: "Edit Review",
      success_title: "Success",
      success_msg: "Thank you for your review!"
    },
    location_sharing: {
      screen_title: "Traveler Location",
      share_label: "Share My Location",
      sharing_active: "Active",
      permission_denied_title: "Permission Denied",
      permission_denied_msg: "Location permission is required to share your location.",
      waiting: "Waiting for traveler's location...",
      last_updated: "Last updated",
      seconds_ago: "{{count}}s ago",
      track_button: "Track Traveler"
    },
    phone_call: {
      call_volunteer: "Call Volunteer",
      call_traveler: "Call Traveler",
      no_phone_title: "No Phone Number",
      no_phone_msg: "This user hasn't shared a phone number."
    },
    traveler_trips: {
      loading: "Loading your trips...",
      plan_new_trip: "Plan New Trip",
      sections: {
        upcoming: "Upcoming Trips",
        past: "Past Trips"
      },
      status: {
        matched: "Matched",
        pending: "Pending",
        completed: "Completed",
        canceled: "Canceled",
        waiting: "Waiting for a volunteer match..."
      },
      labels: {
        traveling_with: "Traveling with",
        traveled_with: "Traveled with"
      },
      actions: {
        cancel_trip: "Cancel Trip",
        new_trip: "New Trip"
      },
      alerts: {
        cancel_title: "Cancel Trip",
        cancel_msg: "Are you sure you want to cancel this trip request?",
        cancel_success_title: "Cancelled",
        cancel_success_msg: "Your trip has been cancelled.",
        error_cancel: "Failed to cancel",
        no_match_title: "No Match Found",
        no_match_msg: "We couldn't find a volunteer for your trip in the last 10 minutes. Would you like to try requesting a new trip or cancel this request?"
      },
      empty: {
        no_upcoming: "No upcoming trips",
        no_upcoming_hint: "Tap \"Plan New Trip\" to get started",
        no_past: "No past trips"
      }
    }
  }
};
