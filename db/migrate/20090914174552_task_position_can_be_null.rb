class TaskPositionCanBeNull < ActiveRecord::Migration
  def self.up
    change_column_default :tasks, :position, nil
    change_column_null :tasks, :position, true
  end

  def self.down
    change_column_null :tasks, :position, false, 0
  end
end
