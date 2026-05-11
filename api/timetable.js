export default async function handler(req, res) {
  try {
    const NEIS_API_KEY = process.env.NEIS_API_KEY;

    if (!NEIS_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "NEIS_API_KEY가 설정되지 않았습니다.",
      });
    }

    const {
      atptOfcdcScCode = "Q10",
      sdSchulCode = "Q100000302",
      grade = "2",
      classNm = "1",
      date,
    } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date 값이 필요합니다. 예: 20260512",
      });
    }

    const url = new URL("https://open.neis.go.kr/hub/hisTimetable");

    url.searchParams.set("KEY", NEIS_API_KEY);
    url.searchParams.set("Type", "json");
    url.searchParams.set("pIndex", "1");
    url.searchParams.set("pSize", "100");
    url.searchParams.set("ATPT_OFCDC_SC_CODE", atptOfcdcScCode);
    url.searchParams.set("SD_SCHUL_CODE", sdSchulCode);
    url.searchParams.set("GRADE", grade);
    url.searchParams.set("CLASS_NM", classNm);
    url.searchParams.set("ALL_TI_YMD", date);

    const response = await fetch(url);
    const data = await response.json();

    const rows = data?.hisTimetable?.[1]?.row ?? [];

    const timetable = rows.map((item) => ({
      period: item.PERIO,
      subject: item.ITRT_CNTNT,
      date: item.ALL_TI_YMD,
      grade: item.GRADE,
      classNm: item.CLASS_NM,
    }));

    return res.status(200).json({
      success: true,
      school: "전남과학고등학교",
      grade,
      classNm,
      date,
      count: timetable.length,
      timetable,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "시간표를 불러오는 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}
