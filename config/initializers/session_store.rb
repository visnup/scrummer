# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_scrummer_session',
  :secret      => '9cbc61ae510d1e670a9f7c4d00805bebc88a740be68b2794cde07d7438d68ff0265cb4ec10074fb5d0bb0495902c0de05c2ed060fb817a2d29c13aecacd1c181'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
