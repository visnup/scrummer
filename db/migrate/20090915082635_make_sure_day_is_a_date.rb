class MakeSureDayIsADate < ActiveRecord::Migration
  def self.up
    execute "update tasks set day = date(day)"
  end

  def self.down
  end
end
