import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Icon name="Zap" size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold">TechSale CRM</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#product" className="text-sm hover:text-primary transition-colors">О продукте</a>
            <a href="#problem" className="text-sm hover:text-primary transition-colors">Проблема</a>
            <a href="#solution" className="text-sm hover:text-primary transition-colors">Решение</a>
            <a href="#author" className="text-sm hover:text-primary transition-colors">Автор</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Войти</Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-primary" size="sm">Попробовать бесплатно</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Революция в управлении сложными продажами
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Не CRM,<br />а система <span className="text-primary">принятия решений</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Адаптивная матрица приоритизации для менеджеров, работающих со сложными технологическими продуктами и проектными продажами
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/signup">
                <Button size="lg" className="gradient-primary text-lg px-8 h-14">
                  <Icon name="Rocket" size={20} className="mr-2" />
                  Начать бесплатно
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                <Icon name="Play" size={20} className="mr-2" />
                Посмотреть демо
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="Check" size={16} className="text-accent" />
                <span>Работает оффлайн</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Check" size={16} className="text-accent" />
                <span>45 секунд на обновление</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Check" size={16} className="text-accent" />
                <span>Объективные приоритеты</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">О продукте</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Облачная CRM для сложных продаж</h2>
              <p className="text-xl text-muted-foreground">
                TechSale CRM — это облачный web-app, адаптированный под desktop и мобильные устройства с возможностью заполнения информации без интернета
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-xl transition-all hover:scale-105 border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name="Monitor" size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Desktop & Mobile</h3>
                <p className="text-sm text-muted-foreground">Полноценная работа на любом устройстве с адаптивным интерфейсом</p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all hover:scale-105 border-border">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Icon name="WifiOff" size={24} className="text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Оффлайн-режим</h3>
                <p className="text-sm text-muted-foreground">Заполняйте данные без интернета, синхронизация автоматическая</p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all hover:scale-105 border-border">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Icon name="Cloud" size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Облачное решение</h3>
                <p className="text-sm text-muted-foreground">Доступ из любой точки мира, данные надёжно защищены</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/20">Проблема рынка</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Классические CRM не работают<br />для сложных продаж</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Сегодня на рынке представлено множество CRM систем, адаптированных под «классическую» воронку продаж. Но при работе со сложными технологическими продуктами эта система не работает.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <Icon name="AlertTriangle" size={24} className="text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Воронка — свалка клиентов</h3>
                <p className="text-sm text-muted-foreground">
                  В воронке невозможно оценить реальную ценность клиента с точки зрения проектной продажи. Все смешано в одну кучу.
                </p>
              </Card>

              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <Icon name="Smartphone" size={24} className="text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Не для «полевых» менеджеров</h3>
                <p className="text-sm text-muted-foreground">
                  Интерфейс CRM адаптирован под ПК. У менеджера «в полях» нет возможности работать с системой на регулярной основе.
                </p>
              </Card>

              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <Icon name="X" size={24} className="text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Нет объективных приоритетов</h3>
                <p className="text-sm text-muted-foreground">
                  Информация не позволяет объективно расставить приоритеты по каждому клиенту в проектной продаже.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Решение</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Матрица приоритизации<br />вместо воронки продаж</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Классические CRM строятся вокруг транзакции. Но проектные продажи — это управление портфелем возможностей с разной зрелостью, риском и потенциалом.
              </p>
            </div>

            <Card className="p-8 mb-12 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <div className="text-center mb-8">
                <p className="text-2xl font-semibold text-primary mb-2">Главный вопрос менеджера:</p>
                <p className="text-xl text-foreground italic">
                  «С каким из 50 клиентов мне работать в ближайшие 2 часа, чтобы максимизировать вероятность закрытия сделки на 6–12 месяцев?»
                </p>
              </div>
            </Card>

            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-8 text-center">Матрица «Влияние × Зрелость»</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="TrendingUp" size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Ось X: Стратегическое влияние</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Потенциал клиента для вашего бизнеса: бюджет × стратегическое совпадение × референсный потенциал
                      </p>
                      <p className="text-sm text-accent">
                        Фокус на качестве, а не количестве
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-secondary/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="Target" size={24} className="text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Ось Y: Зрелость потребности</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Готовность к покупке: четкость ТЗ × бюджет выделен × решение принято × сроки определены
                      </p>
                      <p className="text-sm text-accent">
                        Объективные индикаторы, не «стадии воронки»
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 quadrant-focus text-white border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Icon name="Zap" size={20} className="text-white" />
                    </div>
                    <h4 className="text-lg font-bold">🔴 Фокус сейчас</h4>
                  </div>
                  <p className="text-sm text-white/90">Высокое влияние + Высокая зрелость</p>
                  <p className="text-xs text-white/70 mt-2">Ежедневная работа, максимальный приоритет</p>
                </Card>

                <Card className="p-6 quadrant-grow text-white border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Icon name="TrendingUp" size={20} className="text-white" />
                    </div>
                    <h4 className="text-lg font-bold">🟠 Выращивать</h4>
                  </div>
                  <p className="text-sm text-white/90">Высокое влияние + Низкая зрелость</p>
                  <p className="text-xs text-white/70 mt-2">Системная работа над ТЗ и бюджетом</p>
                </Card>

                <Card className="p-6 quadrant-monitor text-white border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Icon name="Eye" size={20} className="text-white" />
                    </div>
                    <h4 className="text-lg font-bold">🟡 Мониторить</h4>
                  </div>
                  <p className="text-sm text-white/90">Низкое влияние + Высокая зрелость</p>
                  <p className="text-xs text-white/70 mt-2">Минимум усилий для закрытия</p>
                </Card>

                <Card className="p-6 quadrant-archive text-gray-300 border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Icon name="Archive" size={20} className="text-gray-300" />
                    </div>
                    <h4 className="text-lg font-bold">⚪ Архив</h4>
                  </div>
                  <p className="text-sm text-gray-400">Низкое влияние + Низкая зрелость</p>
                  <p className="text-xs text-gray-500 mt-2">Напоминание через 90 дней</p>
                </Card>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border-primary/30">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name="Smartphone" size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Мобильный первый</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Заполнение за 45 секунд в лифте. Слайдеры вместо форм. Оффлайн-режим с автосинхронизацией.
                </p>
                <Badge variant="outline" className="text-xs">
                  <Icon name="Clock" size={12} className="mr-1" />
                  45 сек на обновление
                </Badge>
              </Card>

              <Card className="p-6 border-secondary/30">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Icon name="BarChart" size={24} className="text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Объективные метрики</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Не «теплый/холодный», а бизнес-показатели: бюджет выделен, четкость ТЗ, влияние стейкхолдера.
                </p>
                <Badge variant="outline" className="text-xs">
                  <Icon name="CheckCircle" size={12} className="mr-1" />
                  Факты, не мнения
                </Badge>
              </Card>

              <Card className="p-6 border-accent/30">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Icon name="Lightbulb" size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Умные рекомендации</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Система подсказывает следующий шаг, обнаруживает риски, формирует ежедневный фокус.
                </p>
                <Badge variant="outline" className="text-xs">
                  <Icon name="Brain" size={12} className="mr-1" />
                  Тренер в кармане
                </Badge>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="author" className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Автор продукта</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Илья Никишин</h2>
            </div>

            <Card className="p-8 border-primary/20">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-5xl font-bold text-white">ИН</span>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-muted-foreground mb-4">
                    На протяжении последних 10-ти лет я занимался продажами сложных технологических продуктов, в последующем начав заниматься управлением продажами совмещая с управлением IT-проектами.
                  </p>
                  <p className="text-lg text-muted-foreground mb-6">
                    Я не по наслышке понимаю внутреннюю кухню полевых менеджеров и людей ответственных за развитие бизнеса.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      <Icon name="Briefcase" size={14} className="mr-1" />
                      10 лет в B2B продажах
                    </Badge>
                    <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                      <Icon name="Code" size={14} className="mr-1" />
                      Управление IT-проектами
                    </Badge>
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      <Icon name="Users" size={14} className="mr-1" />
                      Управление продажами
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Готовы изменить подход<br />к управлению продажами?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Попробуйте TechSale CRM бесплатно 14 дней. Без привязки карты.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/signup">
                <Button size="lg" className="gradient-primary text-lg px-8 h-14">
                  <Icon name="Rocket" size={20} className="mr-2" />
                  Начать бесплатно
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                <Icon name="MessageCircle" size={20} className="mr-2" />
                Связаться с нами
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              14 дней бесплатно • Без привязки карты • Техподдержка 24/7
            </p>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Icon name="Zap" size={16} className="text-white" />
              </div>
              <span className="font-bold">TechSale CRM</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-primary transition-colors">Условия использования</a>
              <a href="#" className="hover:text-primary transition-colors">Контакты</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 TechSale CRM. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;