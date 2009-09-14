require 'test_helper'

class TaskTest < ActiveSupport::TestCase
  test "removing from list" do
    tasks(:one).destroy
    assert_equal 0, tasks(:two).position
  end

  test "moving in list" do
    t = tasks(:two)
    t.position = 0
    assert t.save
    assert_equal [0, 1, 2], [t, tasks(:one), tasks(:three)].collect(&:position)
  end

  test "moving between lists" do
    t = tasks(:two)
    t.person = people(:two)
    t.position = 0
    assert t.save
    assert_equal [0, 1], [tasks(:one), tasks(:three)].collect(&:position)
    assert_equal 0, t.position
  end

  test "appending to end of list" do
    p = people(:one)
    assert t = p.tasks.create(:kind => 'week', :day => Date.today)
    assert_equal 3, t.position
  end
end
