import javax.swing.*;
import java.awt.*;

public class DrinkOrder extends JFrame {
    private JComboBox<String> menuBox =
            new JComboBox<>(new String[]{"아메리카노", "카페라테", "녹차"});   // ① 목록에서 하나 고르기
    private JRadioButton smallButton = new JRadioButton("작은 컵", true);   // ② 둘 중 하나만
    private JRadioButton largeButton = new JRadioButton("큰 컵");
    private JCheckBox shotBox = new JCheckBox("샷 추가");                   // ③ 여러 개 고를 수 있음
    private JCheckBox syrupBox = new JCheckBox("시럽 추가");
    private JButton orderButton = new JButton("주문하기");
    private JLabel resultLabel = new JLabel("메뉴를 골라 주세요", SwingConstants.CENTER); // ④ 결과

    public DrinkOrder() {
        setTitle("음료 주문");
        setLayout(new GridLayout(5, 1));

        JPanel menuPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        menuPanel.add(new JLabel("메뉴"));
        menuPanel.add(menuBox);

        ButtonGroup sizeGroup = new ButtonGroup();      // 그룹으로 묶어야 하나만 선택됨
        sizeGroup.add(smallButton);
        sizeGroup.add(largeButton);
        JPanel sizePanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        sizePanel.add(smallButton);                     // 화면에는 패널에 따로 붙여야 보임
        sizePanel.add(largeButton);

        JPanel optionPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        optionPanel.add(shotBox);
        optionPanel.add(syrupBox);

        orderButton.addActionListener(e -> {
            String menu = (String) menuBox.getSelectedItem();     // Object로 나오므로 형변환
            String size = smallButton.isSelected() ? "작은 컵" : "큰 컵";
            String option = "";
            if (shotBox.isSelected()) option += " + 샷";
            if (syrupBox.isSelected()) option += " + 시럽";
            resultLabel.setText("주문: " + menu + ", " + size + option);
        });

        add(menuPanel);
        add(sizePanel);
        add(optionPanel);
        add(orderButton);
        add(resultLabel);

        setSize(320, 260);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new DrinkOrder().setVisible(true));
    }
}
