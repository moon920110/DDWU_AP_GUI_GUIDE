import javax.swing.*;
import java.awt.*;

public class InputForm extends JFrame {
    private JTextField nameField = new JTextField(12);          // ① 한 줄 입력
    private JPasswordField pwField = new JPasswordField(12);    // ② 비밀번호 입력
    private JTextArea logArea = new JTextArea(5, 24);           // ③ 여러 줄 글자
    private JButton okButton = new JButton("확인");              // ④ 확인 버튼

    public InputForm() {
        setTitle("입력 받기");
        setLayout(new BorderLayout(5, 5));

        JPanel formPanel = new JPanel(new GridLayout(2, 2, 5, 5));
        formPanel.add(new JLabel("이름"));
        formPanel.add(nameField);
        formPanel.add(new JLabel("비밀번호"));
        formPanel.add(pwField);

        logArea.setEditable(false);      // 사용자가 직접 고치지 못하게
        logArea.setLineWrap(true);       // 줄이 길면 자동 줄바꿈
        okButton.addActionListener(e -> {
            String name = nameField.getText();                    // 입력한 글자 읽기
            int pwLength = pwField.getPassword().length;          // 비밀번호는 char[]로 읽음
            logArea.append(name + "님, 비밀번호 " + pwLength + "자리를 입력했어요\n");
            nameField.setText("");                                // 입력칸 비우기
            pwField.setText("");
        });

        add(formPanel, BorderLayout.NORTH);
        add(new JScrollPane(logArea), BorderLayout.CENTER);
        add(okButton, BorderLayout.SOUTH);

        pack();                                                   // 내용에 맞춰 창 크기 자동 조절
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new InputForm().setVisible(true));
    }
}
