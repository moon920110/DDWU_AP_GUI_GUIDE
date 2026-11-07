// GradeManager.java
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

// 화면(GUI)만 맡는 클래스. 저장과 계산은 GradeBook에게 맡긴다.
public class GradeManager extends JFrame {
    private GradeBook book = new GradeBook();
    private JTextField nameField = new JTextField(8);
    private JTextField scoreField = new JTextField(4);
    private DefaultTableModel tableModel = new DefaultTableModel(new String[]{"이름", "점수"}, 0);
    private JTable table = new JTable(tableModel);
    private JLabel averageLabel = new JLabel("평균: 0.0점");

    public GradeManager() {
        setTitle("성적 관리");
        setLayout(new BorderLayout(5, 5));

        // ① 위쪽: 입력 영역
        JPanel inputPanel = new JPanel();
        JButton addButton = new JButton("추가");
        inputPanel.add(new JLabel("이름"));
        inputPanel.add(nameField);
        inputPanel.add(new JLabel("점수"));
        inputPanel.add(scoreField);
        inputPanel.add(addButton);

        // ③④ 아래쪽: 평균과 삭제 버튼
        JPanel bottomPanel = new JPanel(new BorderLayout());
        JButton deleteButton = new JButton("선택 삭제");
        bottomPanel.add(averageLabel, BorderLayout.WEST);
        bottomPanel.add(deleteButton, BorderLayout.EAST);
        bottomPanel.setBorder(BorderFactory.createEmptyBorder(0, 10, 5, 5));

        addButton.addActionListener(e -> addStudent());
        deleteButton.addActionListener(e -> deleteStudent());

        add(inputPanel, BorderLayout.NORTH);
        add(new JScrollPane(table), BorderLayout.CENTER);     // ② 가운데: 표
        add(bottomPanel, BorderLayout.SOUTH);

        setSize(380, 300);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    private void addStudent() {
        String name = nameField.getText().trim();
        if (name.isEmpty()) {
            JOptionPane.showMessageDialog(this, "이름을 입력하세요.");
            return;
        }
        try {
            int score = Integer.parseInt(scoreField.getText().trim());
            book.add(new Student(name, score));                 // 데이터는 GradeBook에
            tableModel.addRow(new Object[]{name, score});       // 화면은 표에
            updateAverage();
            nameField.setText("");
            scoreField.setText("");
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "점수는 숫자로 입력하세요.");
        }
    }

    private void deleteStudent() {                              // ④ 선택 삭제
        int row = table.getSelectedRow();
        if (row == -1) {
            JOptionPane.showMessageDialog(this, "삭제할 줄을 먼저 선택하세요.");
            return;
        }
        book.remove(row);
        tableModel.removeRow(row);
        updateAverage();
    }

    private void updateAverage() {                              // ③ 평균 표시
        averageLabel.setText(String.format("평균: %.1f점", book.average()));
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new GradeManager().setVisible(true));
    }
}
