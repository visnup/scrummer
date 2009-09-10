class CreateTasks < ActiveRecord::Migration
  def self.up
    create_table :tasks do |t|
      t.belongs_to :person
      t.string :kind
      t.text :body
      t.boolean :done, :null => false, :default => false
      t.date :created_on

      t.timestamps
    end
  end

  def self.down
    drop_table :tasks
  end
end
