class AddIndexesOnTasks < ActiveRecord::Migration
  def self.up
    add_index :tasks, [:day, :person_id, :kind]
  end

  def self.down
    remove_index :tasks, [:day, :person_id, :kind]
  end
end
