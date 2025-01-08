document.addEventListener('DOMContentLoaded', function () {
  // 数据存储
  const userKey = 'users';

  // 获取用户数据
  let users = JSON.parse(localStorage.getItem(userKey)) || [];

  // 保存数据到 localStorage
  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  const createUserForm = document.getElementById('createUserForm');
  const userTableBody = document.getElementById('userTableBody');
  const editModal = document.getElementById('editModal');
  const editUserForm = document.getElementById('editUserForm');
  const closeButton = document.querySelectorAll('.close-button');
  const exportUsersButton = document.getElementById('exportUsers');
  const importUsersButton = document.getElementById('importUsersButton');
  const importUsersInput = document.getElementById('importUsers');
  let editingUserId = null;
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

  function displayUsers() {
    userTableBody.innerHTML = '';
    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
              <td>${user.name}</td>
              <td>${user.age}</td>
              <td>${user.birthday}</td>
              <td>
                  <button class="edit-btn" data-id="${user.id}">编辑</button>
                  <button class="delete-btn" data-id="${user.id}">删除</button>
              </td>
          `;
      userTableBody.appendChild(row);
    });
  }

  // 创建新用户
  createUserForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const birthday = document.getElementById('birthday').value;

    if (!name || !age || !birthday) {
      alert('请填写所有字段');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name,
      age: age,
      birthday: birthday
    };
    users.push(newUser);
    saveData(userKey, users);
    displayUsers();
    createUserForm.reset();
    successMessage.textContent = '用户创建成功!';
    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  });

  // 显示用户列表
  displayUsers();


  // 打开编辑模态框
  userTableBody.addEventListener('click', function (e) {
    if (e.target.classList.contains('edit-btn')) {
      editingUserId = parseInt(e.target.getAttribute('data-id'));
      const user = users.find(user => user.id === editingUserId);
      if (user) {
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editName').value = user.name;
        document.getElementById('editAge').value = user.age;
        document.getElementById('editBirthday').value = user.birthday;
        editModal.style.display = 'block';
      }
    }

    // 删除用户
    if (e.target.classList.contains('delete-btn')) {
      const userId = parseInt(e.target.getAttribute('data-id'));
      if (confirm('确定要删除该用户吗？')) {
        users = users.filter(user => user.id !== userId);
        saveData(userKey, users);
        displayUsers();
        successMessage.textContent = '用户删除成功!';
        successMessage.style.display = 'block';
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 3000);
      }
    }
  });
  // 关闭模态框
  closeButton.forEach(button => {
    button.addEventListener('click', function () {
      editModal.style.display = 'none';
    });
  });
  window.addEventListener('click', function (e) {
    if (e.target === editModal) {
      editModal.style.display = 'none';
    }
  });


  // 编辑用户
  editUserForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const editUserId = parseInt(document.getElementById('editUserId').value);
    const editName = document.getElementById('editName').value;
    const editAge = document.getElementById('editAge').value;
    const editBirthday = document.getElementById('editBirthday').value;

    if (!editName || !editAge || !editBirthday) {
      alert('请填写所有字段');
      return;
    }

    const updatedUsers = users.map(user => {
      if (user.id === editUserId) {
        return { ...user, name: editName, age: editAge, birthday: editBirthday };
      }
      return user;
    });
    users = updatedUsers;
    saveData(userKey, users);
    displayUsers();
    editModal.style.display = 'none';
    successMessage.textContent = '用户保存成功!';
    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  });
  // 导出用户
  exportUsersButton.addEventListener('click', function () {
    const json = JSON.stringify(users, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.json';
    a.click();
    URL.revokeObjectURL(url);
  });
  // 导入用户
  importUsersButton.addEventListener('click', function () {
    importUsersInput.click();
  });
  importUsersInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const importedUsers = JSON.parse(event.target.result);
          if (Array.isArray(importedUsers)) {
            users = importedUsers;
            saveData(userKey, users);
            displayUsers();
            successMessage.textContent = '用户导入成功!';
            successMessage.style.display = 'block';
            setTimeout(() => {
              successMessage.style.display = 'none';
            }, 3000);
          } else {
            alert('导入的文件格式不正确，请选择 JSON 格式的文件!');
          }
        } catch (error) {
          alert('导入的文件解析错误，请选择正确的 JSON 格式文件');
        }
      };
      reader.readAsText(file);
    }
  });
});