class SprintKindIsWeekKind < ActiveRecord::Migration
  def self.up
    execute "update tasks set kind = 'week' where kind = 'sprint'"
  end

  def self.down
  end
end
