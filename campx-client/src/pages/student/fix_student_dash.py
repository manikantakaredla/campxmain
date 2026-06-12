import os
import re

file_path = r'c:\Users\manik\Music\campx final\campx-client\src\pages\student\StudentDashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update fetchDashboardData
old_fetch = """  const fetchDashboardData = async () => {
    try {
      const [announcementsRes, resourcesRes, eventsRes, notifRes] = await Promise.all([
        announcementService.getAll({ page: 1, limit: 5 }),
        resourceService.getAll({ page: 1, limit: 5 }),
        calendarService.getUpcoming(),
        notificationService.getUnreadCount()
      ])

      setRecentAnnouncements(announcementsRes.announcements || [])
      setRecentResources(resourcesRes.resources || [])
      setUpcomingEvents(eventsRes.activities || [])
      setStats({
        announcements: announcementsRes.pagination?.total || 0,
        resources: resourcesRes.pagination?.total || 0,
        events: eventsRes.activities?.length || 0,
        unreadNotifications: notifRes.unreadCount || 0
      })
    } catch (error) {"""

new_fetch = """  const fetchDashboardData = async () => {
    try {
      const [announcementsRes, resourcesRes, eventsRes, notifRes, facultyRes] = await Promise.all([
        announcementService.getAll({ page: 1, limit: 5 }),
        resourceService.getAll({ page: 1, limit: 5 }),
        calendarService.getUpcoming(),
        notificationService.getUnreadCount(),
        api.get('/student/assigned-faculty').catch(() => ({ data: { success: false } }))
      ])

      setRecentAnnouncements(announcementsRes.announcements || [])
      setRecentResources(resourcesRes.resources || [])
      setUpcomingEvents(eventsRes.activities || [])
      setStats({
        announcements: announcementsRes.pagination?.total || 0,
        resources: resourcesRes.pagination?.total || 0,
        events: eventsRes.activities?.length || 0,
        unreadNotifications: notifRes.unreadCount || 0
      })
      
      if (facultyRes && facultyRes.data && facultyRes.data.success) {
        setAssignedFaculty(facultyRes.data.data)
      }
    } catch (error) {"""

if "facultyRes" not in content:
    content = content.replace(old_fetch, new_fetch)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated StudentDashboard.jsx to fetch assigned faculty")
