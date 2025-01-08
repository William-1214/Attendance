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


  const createAttendanceForm = document.getElementById('createAttendanceForm');
  const userCheckboxes = document.getElementById('userCheckboxes');
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
  // 显示用户列表
  function displayUserCheckboxes() {
    userCheckboxes.innerHTML = '';
    users.forEach(user => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `user-${user.id}`;
      checkbox.value = user.id;

      const label = document.createElement('label');
      label.htmlFor = `user-${user.id}`;
      label.textContent = user.name;

      userCheckboxes.appendChild(checkbox);
      userCheckboxes.appendChild(label);
      userCheckboxes.appendChild(document.createElement('br'));
    });
  }
  displayUserCheckboxes();

  // 创建出席记录
  createAttendanceForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const attendanceDate = document.getElementById('attendanceDate').value;
    const checkedUsers = Array.from(userCheckboxes.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => parseInt(checkbox.value));
    if (!attendanceDate || checkedUsers.length === 0) {
      alert('请选择出席日期和人员');
      return;
    }

    const newAttendance = {
      id: Date.now(),
      date: attendanceDate,
      attendees: checkedUsers
    };
    attendances.push(newAttendance);
    saveData(attendanceKey, attendances);
    createAttendanceForm.reset();
    successMessage.textContent = '出席记录创建成功!';
    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  });

});