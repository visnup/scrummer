class Task < ActiveRecord::Base
  belongs_to :person
  named_scope :on, lambda { |date| { :conditions => ['date(created_on) = ?', date] } }
end
