class TasksController < ApplicationController
  # GET /tasks
  # GET /tasks.xml
  def index
    @date = params[:date] ? Date.parse(params[:date]) : Time.zone.today
    srand @date.to_time.to_i

    @people = Person.active.sort_by { rand }
    @tasks = Task.on(@date) |
             Task.kind('week').on(@date.beginning_of_week) |
             Task.kind('late').on(@date.yesterday).each { |t| t.kind = 'late-yesterday' }

    yesterday = @tasks.select { |t| t.kind == 'yesterday' }
    @empty_yesterday = (@people - yesterday.collect(&:person).uniq).map do |p|
      d = p.tasks.kind('today').before(@date).maximum('day')
      p.tasks.kind('today').on(d)
    end.flatten

    week = @tasks.select { |t| t.kind == 'week' }
    @empty_week = (@people - week.collect(&:person).uniq).map do |p|
      d = p.tasks.kind('week').before(@date.beginning_of_week).maximum('day')
      p.tasks.kind('week').on(d)
    end.flatten

    days = (@date - 3.weeks .. @date)
    @productivity = Task.kind('yesterday').after(days.begin).all(
      :select => 'person_id, day, done, count(*) as count',
      :group => 'person_id, day, done'
    ).map(&:attributes).group_by { |r| r['person_id'] }
    @productivity.each do |id, t|
      t = t.group_by { |r| r['day'] }
      t = days.map do |d|
        next if d.wday == 0 || d.wday == 1
        if t[d]
          { t[d].first['done'] => t[d].first['count'].to_i,
            t[d].last['done'] => t[d].last['count'].to_i }
        else
          { true => 0, false => 0 }
        end
      end.compact
      @productivity[id] = [
        t.map { |x| x[true] || 0 },
        t.map { |x| x[false] || 0 }
      ]
    end

    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => @tasks }
      format.xml  { render :xml => @tasks }
    end
  end

  # GET /tasks/1
  # GET /tasks/1.xml
  def show
    @task = Task.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => @task }
      format.xml  { render :xml => @task }
    end
  end

  # GET /tasks/new
  # GET /tasks/new.xml
  def new
    @task = Task.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render :json => @task }
      format.xml  { render :xml => @task }
    end
  end

  # GET /tasks/1/edit
  def edit
    @task = Task.find(params[:id])
  end

  # POST /tasks
  # POST /tasks.xml
  def create
    @task = Task.new(params[:task])
    @task.person = Person.find(params[:person_id])  if params[:person_id]

    respond_to do |format|
      if @task.save
        flash[:notice] = 'Task was successfully created.'
        format.html { redirect_to(@task) }
        format.json { render :json => @task, :status => :created, :location => @task }
        format.xml  { render :xml => @task, :status => :created, :location => @task }
      else
        format.html { render :action => "new" }
        format.json { render :json => @task.errors, :status => :unprocessable_entity }
        format.xml  { render :xml => @task.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /tasks/1
  # PUT /tasks/1.xml
  def update
    @task = Task.find(params[:id])

    respond_to do |format|
      if @task.update_attributes(params[:task])
        flash[:notice] = 'Task was successfully updated.'
        format.html { redirect_to(@task) }
        format.json { head :ok }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.json { render :json => @task.errors, :status => :unprocessable_entity }
        format.xml  { render :xml => @task.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1
  # DELETE /tasks/1.xml
  def destroy
    @task = Task.find(params[:id])
    @task.destroy

    respond_to do |format|
      format.html { redirect_to(tasks_url) }
      format.json { head :ok }
      format.xml  { head :ok }
    end
  end
end
