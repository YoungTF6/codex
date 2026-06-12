var chartOption = {
  title:
  {
    subtext: ""
    , textStyle: { fontSize: 14 }
  },
  tooltip:
  {
    trigger: "axis"
  },
  polar: [
    {
      indicator: [
        { text: "执业与专业道德素养", max: 100 }
        , { text: "沟通和人际交往能力", max: 100 }
        , { text: "全科诊疗能力", max: 100 }
        , { text: "个人、家庭和社区健康照顾能力", max: 100 }
        , { text: "利用、协调资源能力", max: 100 }
      ]
      , radius: 130
    }
  ]
  , series: [
    {
      type: "radar"
      , center: ["50%", "50%"]
      , itemStyle:
      {
        normal: {
          areaStyle: {
            type: "default"
          }
        }
      },
      data: [
        {
          value: [97, 32, 74, 95, 88],
          name: "",
          itemStyle: {
            normal: {
              color: 'rgba(0,150,136,0.7)',
            },
          },
        }
      ]
    }]
};