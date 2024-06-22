const pool = require("./db");
class Student {
  // hàm xây dựng đối tượng
  constructor(id, name, birthday, gender) {
    this.id = id;
    this.name = name;
    this.birthday = birthday;
    this.gender = gender;
  }

  static SELECT_ALL_QUERY = 'SELECT * FROM student'

  static buildLimit = (page = null, item_per_page = null) => {
    let limit = "";
    if (page && item_per_page) {
      const row_index = (page - 1) * item_per_page;
      limit = `LIMIT ${row_index}, ${item_per_page}`;
    }
    return limit;
  };
  // hàm lấy tất cả dữ liệu trong bảng
  // trả về danh sách chứa các đối tượng student
  // static là gọi từ class, vd: Student.all, không cần phải new Student(...).all()
  static all = async (page = null, item_per_page = null) => {
    try {
      // xây dựng phân trang
      const limit = this.buildLimit(page, item_per_page);
      const [rows] = await pool.execute(`${this.SELECT_ALL_QUERY} ${limit}`);
      return this.convertArrayToObject(rows);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  static convertArrayToObject = (rows) => {
    const students = rows.map(
      (row) => new Student(row.id, row.name, row.birthday, row.gender)
    );
    return students;
  };

  static getByPattern = async (search, page = null, item_per_page = null) => {
    try {
      // xây dựng phân trang
      const limit = this.buildLimit(page, item_per_page);
      const [rows] = await pool.execute(
        `${this.SELECT_ALL_QUERY} WHERE name LIKE ? ${limit}`,
        [`%${search}%`]
      );
      return this.convertArrayToObject(rows);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  static save = async (data) => {
    try {
      const [result] = await pool.execute(
        "INSERT INTO student VALUE(?,?,?,?)",
        [null, data.name, data.birthday, data.gender]
      );
      console.log(result);
      return result.insertId;
    } catch (error) {
      throw new Error(error);
    }
  };
  // tìm 1 dòng student
  static find = async (id) => {
    try {
      const [rows] = await pool.execute(`${this.SELECT_ALL_QUERY} WHERE id=?`, [
        id,
      ]);
      // check nếu không có dòng nào thỏa mãn trong bảng student
      if (rows.length === 0) {
        return null;
      }
      const row = rows[0];
      const student = new Student(row.id, row.name, row.birthday, row.gender);
      return student;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  update = async () => {
    try {
      await pool.execute(
        "UPDATE student SET name = ?, birthday = ?, gender = ? WHERE id = ?",
        [this.name, this.birthday, this.gender, this.id]
      );
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };
  destroy = async () => {
    try {
      await pool.execute(
        "DELETE FROM student WHERE id = ?",
        [this.id]
      );
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };
}

module.exports = Student;
