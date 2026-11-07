import javax.swing.*;
import java.awt.*;

public class TodoList extends JFrame {
    private DefaultListModel<String> todoModel = new DefaultListModel<>();  // 목록의 데이터
    private JList<String> todoList = new JList<>(todoModel);                // ② 데이터를 보여주는 목록
    private JTextField inputField = new JTextField(15);
    private JButton addButton = new JButton("추가");
    private JButton removeButton = new JButton("선택 삭제");

    public TodoList() {
        setTitle("할 일 목록");
        setLayout(new BorderLayout());

        JPanel inputPanel = new JPanel();                 // ① 입력칸 + 추가 버튼
        inputPanel.add(inputField);
        inputPanel.add(addButton);

        addButton.addActionListener(e -> {
            String text = inputField.getText().trim();
            if (!text.isEmpty()) {
                todoModel.addElement(text);               // 모델에 넣으면 목록에 바로 보임
                inputField.setText("");
            }
        });

        removeButton.addActionListener(e -> {             // ③ 선택한 줄 지우기
            int index = todoList.getSelectedIndex();      // 선택이 없으면 -1
            if (index != -1) {
                todoModel.remove(index);
            }
        });

        add(inputPanel, BorderLayout.NORTH);
        add(new JScrollPane(todoList), BorderLayout.CENTER);   // 길어지면 스크롤 생김
        add(removeButton, BorderLayout.SOUTH);

        setSize(320, 260);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new TodoList().setVisible(true));
    }
}
