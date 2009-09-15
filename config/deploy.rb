set :application, "scrummer"
set :repository,  "git://github.com/visnup/scrummer.git"
set :deploy_to, "/home/build/#{application}"
set :user, "build"
set :use_sudo, false
set :scm, :git

role :web, "build.dev"

namespace :deploy do
  task :restart, :roles => :web, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end

  task :symlink_db, :roles => [:web] do
    run "rm -fr #{release_path}/db/production.sqlite3 &&
      ln -nfs #{shared_path}/db/production.sqlite3 #{release_path}/db/production.sqlite3"
  end
end

before "deploy:restart", "deploy:symlink_db"
