import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class StudentTable extends JFrame {

    public StudentTable() {
        setTitle("학생 명단");

        String[] columns = {"학번", "이름", "학과"};                        // ① 열 제목
        DefaultTableModel model = new DefaultTableModel(columns, 0);      // 0 = 처음에는 행 없음
        model.addRow(new Object[]{"20260001", "김자바", "컴퓨터공학"});      // ② 한 줄씩 추가
        model.addRow(new Object[]{"20260002", "이객체", "소프트웨어"});
        model.addRow(new Object[]{"20260003", "박상속", "인공지능"});

        JTable table = new JTable(model);
        add(new JScrollPane(table));        // 스크롤 패널에 넣어야 열 제목이 보임
        setSize(360, 160);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new StudentTable().setVisible(true));
    }
}
