require 'rubygems'
require 'activerecord'
require 'config/environment'

ActiveRecord::Schema.define do
  create_table :people do |t|
    t.string :name
    t.boolean :active, :default => true, :null => false
  end

  create_table :tasks do |t|
  end
end
