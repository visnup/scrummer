class FixDoneField < ActiveRecord::Migration
  def self.up
    execute "update tasks set done = 't' where done = 'true'"
    execute "update tasks set done = 'f' where done = 'false'"
  end

  def self.down
  end
end
