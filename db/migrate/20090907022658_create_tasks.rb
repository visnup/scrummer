class CreateTasks < ActiveRecord::Migration
  def self.up
    create_table :tasks do |t|
      t.belongs_to :person
      t.string :kind
      t.text :body
      t.boolean :done, :null => false, :default => false
      t.integer :position, :null => false, :default => 0
      t.date :day

      t.timestamps
    end
  end

  def self.down
    drop_table :tasks
  end
end
