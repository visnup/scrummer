class Person < ActiveRecord::Base
  has_many :tasks
  scope :active, :conditions => { :active => true }
end
