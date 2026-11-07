import javax.swing.*;
import java.awt.*;

public class DialogMenuDemo extends JFrame {
    private JLabel statusLabel = new JLabel("메뉴나 버튼을 눌러 보세요", SwingConstants.CENTER);

    public DialogMenuDemo() {
        setTitle("대화상자와 메뉴");
        setLayout(new BorderLayout());

        // ① 메뉴: 메뉴바 > 메뉴 > 메뉴 항목
        JMenuBar menuBar = new JMenuBar();
        JMenu fileMenu = new JMenu("파일");
        JMenuItem newItem = new JMenuItem("새로 만들기");
        JMenuItem exitItem = new JMenuItem("종료");
        newItem.addActionListener(e -> statusLabel.setText("새로 만들기를 눌렀어요"));
        exitItem.addActionListener(e -> System.exit(0));
        fileMenu.add(newItem);
        fileMenu.addSeparator();                         // 구분선
        fileMenu.add(exitItem);
        menuBar.add(fileMenu);
        setJMenuBar(menuBar);                            // add가 아니라 setJMenuBar

        JButton messageButton = new JButton("알림");
        JButton confirmButton = new JButton("확인");
        JButton inputButton = new JButton("입력");

        // ② 알림 창
        messageButton.addActionListener(e ->
                JOptionPane.showMessageDialog(this, "저장되었습니다."));

        // ③ 예 / 아니오 / 취소 창
        confirmButton.addActionListener(e -> {
            int answer = JOptionPane.showConfirmDialog(this, "정말 삭제할까요?");
            if (answer == JOptionPane.YES_OPTION) {
                statusLabel.setText("삭제했어요");
            }
        });

        // ④ 입력 창
        inputButton.addActionListener(e -> {
            String name = JOptionPane.showInputDialog(this, "이름을 입력하세요");
            if (name != null) {                          // 취소를 누르면 null
                statusLabel.setText(name + "님, 안녕하세요");
            }
        });

        JPanel buttonPanel = new JPanel();
        buttonPanel.add(messageButton);
        buttonPanel.add(confirmButton);
        buttonPanel.add(inputButton);

        add(statusLabel, BorderLayout.CENTER);
        add(buttonPanel, BorderLayout.SOUTH);

        setSize(340, 220);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new DialogMenuDemo().setVisible(true));
    }
}
