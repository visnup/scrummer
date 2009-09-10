class IndexController < ApplicationController
  def index
    @date = params[:date] ? Date.parse(params[:date]) : Time.zone.today
    srand @date.to_time.to_i

    @people = Person.active.shuffle
    @tasks = Task.on(@date)
  end
end
