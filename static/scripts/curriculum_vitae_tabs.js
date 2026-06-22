document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.tab-button');
    const sections = document.querySelectorAll('.tab-section');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.tabTarget;

            buttons.forEach((item) => item.classList.remove('is-active'));
            sections.forEach((section) => section.classList.remove('is-active'));

            button.classList.add('is-active');
            document.getElementById(targetId).classList.add('is-active');
        });
    });
});
