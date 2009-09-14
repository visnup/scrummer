require 'rubygems'
require 'sqlite3'
require 'activesupport'

from, to = ARGV.map { |f| SQLite3::Database.new f }
people = to.prepare 'insert into people (id, name, active, created_at, updated_at) values (:id, :name, :active, :created_at, :updated_at)'
from.query 'select * from people' do |rs|
  rs.each do |r|
    people.execute Hash[rs.columns.zip(r)]
  end
end

tasks = to.prepare 'insert into tasks (person_id, kind, body, done, position, day, created_at, updated_at) values (:person_id, :kind, :body, :done, :position, :day, :created_at, :updated_at)'
from.query 'select * from lists group by person_id, kind, `on`' do |rs|
  rs.each do |r|
    list = Hash[rs.columns.zip(r)]
    items = list['body'].split(/\n?\* */).reject(&:blank?)
    items.each_with_index do |t, i|
      done = t.gsub!(/~~/, '') ? true : false
      tasks.execute 'person_id' => list['person_id'],
        'kind' => list['kind'], 'body' => t, 'done' => done, 'position' => i,
        'day' => list['on'], 'created_at' => list['created_at'],
        'updated_at' => list['updated_at']
    end
  end
end
