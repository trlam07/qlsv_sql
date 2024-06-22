const pool = require("./db");
class Register {
  // hàm xây dựng đối tượng
  constructor(id, student_id, subject_id, score, student_name, subject_name) {
    this.id = id;
    this.student_id = student_id;
    this.subject_id = subject_id;
    this.score = score;
    this.student_name = student_name;
    this.subject_name = subject_name;
  }

  static SELECT_ALL_QUERY = `
  SELECT register.*, student.name AS student_name, subject.name AS subject_name 
  from register
  JOIN student ON register.student_id = student.id
  JOIN subject ON register.subject_id = subject.id
  `

  static buildLimit = (page = null, item_per_page = null) => {
    let limit = "";
    if (page && item_per_page) {
      const row_index = (page - 1) * item_per_page;
      limit = `LIMIT ${row_index}, ${item_per_page}`;
    }
    return limit;
  };
  // hàm lấy tất cả dữ liệu trong bảng
  // trả về danh sách chứa các đối tượng register
  // static là gọi từ class, vd: Register.all, không cần phải new Register(...).all()
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
    const registers = rows.map(
      (row) => new Register(row.id, row.student_id, row.subject_id, row.score != null ? row.score.toFixed(2) : null, row.student_name, row.subject_name)
    );
    return registers;
  };

  static getByPattern = async (search, page = null, item_per_page = null) => {
    try {
      // xây dựng phân trang
      const limit = this.buildLimit(page, item_per_page);
      const [rows] = await pool.execute(
        `${this.SELECT_ALL_QUERY} WHERE student.name LIKE ? OR subject.name LIKE ? ${limit}`,
        [`%${search}%`, `%${search}%`]
      );
      return this.convertArrayToObject(rows);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
// lấy danh sách đăng ký mh của 1 sv
  static getByStudentId = async (student_id, page = null, item_per_page = null) => {
    try {
      // xây dựng phân trang
      const limit = this.buildLimit(page, item_per_page);
      const [rows] = await pool.execute(
        `${this.SELECT_ALL_QUERY} WHERE register.student_id = ? ${limit}`,
        [student_id]
      );
      return this.convertArrayToObject(rows);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  // lấy danh sách đăng ký mh của 1 sv
  static getBySubjectId = async (subject_id, page = null, item_per_page = null) => {
    try {
      // xây dựng phân trang
      const limit = this.buildLimit(page, item_per_page);
      const [rows] = await pool.execute(
        `${this.SELECT_ALL_QUERY} WHERE register.subject_id = ? ${limit}`,
        [subject_id]
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
        "INSERT INTO register VALUE(?,?,?, ?)",
        [null, data.student_id, data.subject_id, null]
      );
      console.log(result);
      return result.insertId;
    } catch (error) {
      throw new Error(error);
    }
  };
  // tìm 1 dòng register
  static find = async (id) => {
    try {
      const [rows] = await pool.execute(`${this.SELECT_ALL_QUERY} WHERE register.id=?`, [
        id,
      ]);
      // check nếu không có dòng nào thỏa mãn trong bảng register
      if (rows.length === 0) {
        return null;
      }
      const registers = this.convertArrayToObject(rows);
      const register = registers[0]
      return register;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  update = async () => {
    try {
      await pool.execute(
        "UPDATE register SET score = ? WHERE id = ?",
        [this.score, this.id]
      );
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };
  destroy = async () => {
    try {
      await pool.execute(
        "DELETE FROM register WHERE id = ?",
        [this.id]
      );
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };
}

module.exports = Register;
