document.addEventListener('DOMContentLoaded', function () {
  // 数据存储
  const userKey = 'users';
  const attendanceKey = 'attendances';

  // 获取用户数据
  let users = JSON.parse(localStorage.getItem(userKey)) || [];
  let attendances = JSON.parse(localStorage.getItem(attendanceKey)) || [];


  // 保存数据到 localStorage
  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  const summaryList = document.getElementById('summaryList');
  const summaryStats = document.getElementById('summaryStats');
  const attendanceModal = document.getElementById('attendanceModal');
  const editAttendanceModal = document.getElementById('editAttendanceModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalTableBody = document.getElementById('modalTableBody');
  const editUserCheckboxes = document.getElementById('editUserCheckboxes');
  const editAttendanceForm = document.getElementById('editAttendanceForm');
  const editModalTitle = document.getElementById('editModalTitle');
  const closeButton = document.querySelectorAll('.close-button');
  const editAttendanceDateInput = document.getElementById('editAttendanceDate');
  const successMessage = document.createElement('div');
  successMessage.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #4caf50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 1000;
      display:none;
  `;
  document.body.appendChild(successMessage);
  const averageAttendanceYear = document.getElementById('averageAttendanceYear');
  const dailyAttendanceCount = document.getElementById('dailyAttendanceCount');
  let editingAttendanceId = null;
  let currentAttendanceModal = null;
  // 按月份显示出席记录
  function displayAttendanceSummary() {
    summaryList.innerHTML = '';
    const groupedAttendances = {};
    let totalAttendees = 0;
    let totalDays = 0;

    attendances.forEach(attendance => {
      const month = new Date(attendance.date).toLocaleString('zh-CN', { month: 'long' });
      if (!groupedAttendances[month]) {
        groupedAttendances[month] = [];
      }
      totalAttendees += attendance.attendees.length;
      totalDays++;
      groupedAttendances[month].push(attendance);
    });
    const yearAverage = totalDays > 0 ? Math.round(totalAttendees / totalDays) : 0;
    averageAttendanceYear.textContent = yearAverage;

    for (const month in groupedAttendances) {
      const monthDiv = document.createElement('div');
      monthDiv.classList.add('month-summary');
      let monthTotalAttendees = 0;
      groupedAttendances[month].forEach(attendance => {
        monthTotalAttendees += attendance.attendees.length;
      });
      const monthAverage = groupedAttendances[month].length > 0 ? Math.round(monthTotalAttendees / groupedAttendances[month].length) : 0;
      monthDiv.innerHTML = `<h3>${month} (平均出席人数: ${monthAverage})</h3>`;
      const datesList = document.createElement('ul');

      groupedAttendances[month].forEach(attendance => {
        const dateItem = document.createElement('li');
        dateItem.textContent = attendance.date;
        dateItem.classList.add('attendance-item');
        dateItem.setAttribute('data-id', attendance.id);
        datesList.appendChild(dateItem);
      });

      monthDiv.appendChild(datesList);
      summaryList.appendChild(monthDiv);
    }
  }
  displayAttendanceSummary();

  // 展示特定出席记录
  summaryList.addEventListener('click', function (e) {
    if (e.target.classList.contains('attendance-item')) {
      const attendanceId = parseInt(e.target.getAttribute('data-id'));
      const attendance = attendances.find(att => att.id === attendanceId);

      if (attendance) {
        dailyAttendanceCount.textContent = attendance.attendees.length;
        modalTitle.textContent = `出席记录: ${attendance.date}`;
        // editAttendanceDateInput.value = attendance.date;
        modalTableBody.innerHTML = '';
        attendance.attendees.forEach(attendeeId => {
          const user = users.find(u => u.id === attendeeId);
          if (user) {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${user.name}</td><td>是</td>`;
            modalTableBody.appendChild(row);
          }
        });
        users.forEach(user => {
          if (!attendance.attendees.includes(user.id)) {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${user.name}</td><td>否</td>`;
            modalTableBody.appendChild(row);
          }
        });
        attendanceModal.style.display = 'block';
        currentAttendanceModal = attendanceModal;
        document.getElementById('editAttendanceButton').addEventListener('click', function () {
          editingAttendanceId = attendanceId;
          editAttendanceModal.style.display = 'block';
          currentAttendanceModal = editAttendanceModal;
          editModalTitle.textContent = `修改出席记录：${attendance.date}`
          document.getElementById('editNewAttendanceDate').value = attendance.date;
          showEditAttendanceCheckboxes(attendance);
        });

        document.getElementById('deleteAttendanceButton').addEventListener('click', function () {
          if (confirm('确定要删除该出席记录吗？')) {
            attendances = attendances.filter(att => att.id !== attendanceId);
            saveData(attendanceKey, attendances);
            attendanceModal.style.display = 'none';
            displayAttendanceSummary();
            successMessage.textContent = '出席记录删除成功!';
            successMessage.style.display = 'block';
            setTimeout(() => {
              successMessage.style.display = 'none';
            }, 3000);
          }
        });

      }
    }
  });
  // 显示编辑的出席记录
  function showEditAttendanceCheckboxes(attendance) {
    editUserCheckboxes.innerHTML = '';
    users.forEach(user => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `edit-user-${user.id}`;
      checkbox.value = user.id;

      if (attendance.attendees.includes(user.id)) {
        checkbox.checked = true;
      }

      const label = document.createElement('label');
      label.htmlFor = `edit-user-${user.id}`;
      label.textContent = user.name;

      editUserCheckboxes.appendChild(checkbox);
      editUserCheckboxes.appendChild(label);
      editUserCheckboxes.appendChild(document.createElement('br'));
    });
  }
  // 编辑出席记录
  editAttendanceForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const newAttendanceDate = document.getElementById('editNewAttendanceDate').value;
    const checkedUsers = Array.from(editUserCheckboxes.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => parseInt(checkbox.value));
    if (checkedUsers.length === 0 || !newAttendanceDate) {
      alert('请选择出席人员或填写出席日期');
      return;
    }
    const updateAttendances = attendances.map(att => {
      if (att.id === editingAttendanceId) {
        return { ...att, attendees: checkedUsers, date: newAttendanceDate };
      }
      return att;
    });
    attendances = updateAttendances;
    saveData(attendanceKey, attendances);
    editAttendanceModal.style.display = 'none';
    attendanceModal.style.display = 'none';
    currentAttendanceModal = null;
    displayAttendanceSummary();
    successMessage.textContent = '出席记录保存成功!';
    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  });
  // 关闭模态框
  closeButton.forEach(button => {
    button.addEventListener('click', function () {
      editAttendanceModal.style.display = 'none';
      attendanceModal.style.display = 'none';
      currentAttendanceModal = null;
    });
  });
  window.addEventListener('click', function (e) {
    if (e.target === editAttendanceModal) {
      editAttendanceModal.style.display = 'none';
    }
    if (e.target === attendanceModal) {
      attendanceModal.style.display = 'none';
    }
    if (currentAttendanceModal && e.target === currentAttendanceModal) {
      currentAttendanceModal.style.display = 'none';
      currentAttendanceModal = null;
    }
  });

});