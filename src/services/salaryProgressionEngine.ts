import {
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  ReviewProposalItem,
  ReviewCategory,
} from '../types';

export function getElapsedMonths(fromDateStr: string, toDateStr: string): number {
  const from = new Date(fromDateStr);
  const to = new Date(toDateStr);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0;
  
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() >= from.getDate()) {
    // If exact day reached or passed
  } else {
    months -= 1;
  }
  return Math.max(0, months);
}

export function evaluateQNCNEligibility(
  profile: QNCNProfile,
  scales: SalaryScaleConfig[],
  rules: GeneralSalaryRules,
  cutoffDateStr: string
): ReviewProposalItem {
  const elapsedMonths = getElapsedMonths(profile.ngayHuongHienTai, cutoffDateStr);
  
  // Find matching scale
  const scale = scales.find((s) => s.ngach === profile.ngach);
  const isSoCap = profile.ngach.includes('Sơ cấp');
  const standardMonthsRequired = isSoCap ? rules.soThangGiuBacSoCap : rules.soThangGiuBacCaoCap;
  
  // Check rewards
  let rewardReductionMonths = 0;
  let rewardNote = '';
  if (profile.khenThuongGanNhat && profile.khenThuongGanNhat !== 'Không') {
    const matchedRule = rules.quyDinhNangTruocHan.find((r) =>
      profile.khenThuongGanNhat.toLowerCase().includes(r.danhHieu.toLowerCase().split('/')[0].trim().toLowerCase()) ||
      r.danhHieu.toLowerCase().includes(profile.khenThuongGanNhat.toLowerCase())
    );
    if (matchedRule) {
      rewardReductionMonths = matchedRule.soThangRutNgan;
      rewardNote = `Đạt danh hiệu ${profile.khenThuongGanNhat} (rút ngắn ${rewardReductionMonths} tháng)`;
    } else if (profile.khenThuongGanNhat.includes('Chiến sĩ thi đua')) {
      rewardReductionMonths = 6;
      rewardNote = `Đạt Chiến sĩ thi đua (rút ngắn 6 tháng)`;
    }
  }
  
  // Check disciplines
  let disciplineExtensionMonths = 0;
  let disciplineNote = '';
  if (profile.kyLuatGanNhat && profile.kyLuatGanNhat !== 'Không') {
    const matchedDisc = rules.quyDinhKyLuat.find((d) =>
      profile.kyLuatGanNhat.toLowerCase().includes(d.hinhThuc.toLowerCase())
    );
    if (matchedDisc) {
      disciplineExtensionMonths = matchedDisc.soThangKeoDai;
      disciplineNote = `Kỷ luật ${profile.kyLuatGanNhat} (kéo dài ${disciplineExtensionMonths} tháng)`;
    } else {
      disciplineExtensionMonths = 6;
      disciplineNote = `Bị kỷ luật (kéo dài 6 tháng)`;
    }
  }

  const effectiveMonthsRequired = Math.max(
    0,
    standardMonthsRequired - rewardReductionMonths + disciplineExtensionMonths
  );

  const isMaxGrade = scale ? profile.bacLuongHienTai >= scale.bacToiDa : false;
  
  let loaiNangLuong: ReviewCategory = 'Chưa đủ điều kiện';
  let bacDeXuat = profile.bacLuongHienTai;
  let heSoDeXuat = profile.heSoLuongHienTai;
  let vuotKhungDeXuat = profile.phanTramVuotKhung || 0;
  let lyDoDeXuat = '';
  let ngayHuongMoi = cutoffDateStr;

  if (disciplineExtensionMonths > 0 && elapsedMonths < standardMonthsRequired + disciplineExtensionMonths) {
    loaiNangLuong = 'Kéo dài do kỷ luật';
    lyDoDeXuat = `Bị kỷ luật ${profile.kyLuatGanNhat}, kéo dài thêm ${disciplineExtensionMonths} tháng. Đã giữ bậc ${elapsedMonths}/${standardMonthsRequired + disciplineExtensionMonths} tháng.`;
  } else if (isMaxGrade) {
    // Xét vượt khung: Đã ở bậc kịch khung
    // Nếu chưa có VK: sau thời gian chuẩn được 5%
    // Nếu đã có VK: mỗi 12 tháng (1 năm) tăng thêm 1%
    if (profile.phanTramVuotKhung === 0) {
      if (elapsedMonths >= standardMonthsRequired) {
        loaiNangLuong = 'Vượt khung';
        vuotKhungDeXuat = rules.mucVuotKhungNamDau;
        lyDoDeXuat = `Đã giữ bậc tối đa (${profile.bacLuongHienTai}) đủ ${elapsedMonths}/${standardMonthsRequired} tháng, đề nghị hưởng phụ cấp thâm niên vượt khung lần đầu ${rules.mucVuotKhungNamDau}%.`;
      } else {
        loaiNangLuong = 'Chưa đủ điều kiện';
        lyDoDeXuat = `Ở bậc kịch khung nhưng mới giữ được ${elapsedMonths}/${standardMonthsRequired} tháng để hưởng vượt khung.`;
      }
    } else {
      // Đã có vượt khung, xét tăng thêm 1% mỗi năm (12 tháng)
      const monthsSinceLastVK = elapsedMonths % 12;
      if (elapsedMonths >= 12) {
        loaiNangLuong = 'Vượt khung';
        vuotKhungDeXuat = profile.phanTramVuotKhung + rules.moiNamVuotKhungThem;
        lyDoDeXuat = `Đang hưởng vượt khung ${profile.phanTramVuotKhung}%, giữ đủ niên hạn tiếp theo, đề nghị nâng lên ${vuotKhungDeXuat}%.`;
      } else {
        loaiNangLuong = 'Chưa đủ điều kiện';
        lyDoDeXuat = `Đang hưởng vượt khung ${profile.phanTramVuotKhung}%, chưa đủ 12 tháng chu kỳ tiếp theo (${monthsSinceLastVK}/12 tháng).`;
      }
    }
  } else {
    // Chưa kịch khung
    if (rewardReductionMonths > 0 && elapsedMonths >= (standardMonthsRequired - rewardReductionMonths)) {
      loaiNangLuong = 'Trước thời hạn';
      bacDeXuat = profile.bacLuongHienTai + 1;
      const nextStep = scale?.danhSachBac.find((b) => b.bac === bacDeXuat);
      heSoDeXuat = nextStep ? nextStep.heSo : profile.heSoLuongHienTai;
      lyDoDeXuat = `Đạt tiêu chuẩn nâng lương trước thời hạn ${rewardReductionMonths} tháng do: ${profile.khenThuongGanNhat}. Thời gian giữ bậc hiện tại: ${elapsedMonths}/${effectiveMonthsRequired} tháng.`;
    } else if (elapsedMonths >= standardMonthsRequired) {
      loaiNangLuong = 'Thường xuyên';
      bacDeXuat = profile.bacLuongHienTai + 1;
      const nextStep = scale?.danhSachBac.find((b) => b.bac === bacDeXuat);
      heSoDeXuat = nextStep ? nextStep.heSo : profile.heSoLuongHienTai;
      lyDoDeXuat = `Giữ bậc đủ niên hạn chuẩn (${elapsedMonths}/${standardMonthsRequired} tháng), hoàn thành tốt nhiệm vụ.`;
    } else {
      loaiNangLuong = 'Chưa đủ điều kiện';
      bacDeXuat = profile.bacLuongHienTai;
      heSoDeXuat = profile.heSoLuongHienTai;
      lyDoDeXuat = `Chưa đủ thời gian giữ bậc quy định (${elapsedMonths}/${effectiveMonthsRequired} tháng). Thiếu ${effectiveMonthsRequired - elapsedMonths} tháng.`;
    }
  }

  // Calculate salary difference
  let chenhLechHeSo = 0;
  let chenhLechTienLuong = 0;

  if (loaiNangLuong === 'Vượt khung') {
    const oldVKMoney = Math.round((profile.heSoLuongHienTai * rules.luongCoSo * (profile.phanTramVuotKhung || 0)) / 100);
    const newVKMoney = Math.round((profile.heSoLuongHienTai * rules.luongCoSo * vuotKhungDeXuat) / 100);
    chenhLechTienLuong = newVKMoney - oldVKMoney;
    chenhLechHeSo = Number(((profile.heSoLuongHienTai * (vuotKhungDeXuat - (profile.phanTramVuotKhung || 0))) / 100).toFixed(3));
  } else if (loaiNangLuong === 'Thường xuyên' || loaiNangLuong === 'Trước thời hạn') {
    chenhLechHeSo = Number((heSoDeXuat - profile.heSoLuongHienTai).toFixed(2));
    chenhLechTienLuong = Math.round(chenhLechHeSo * rules.luongCoSo);
  }

  return {
    id: `prop-auto-${profile.id}`,
    qncnId: profile.id,
    maQNCN: profile.maQNCN,
    hoVaTen: profile.hoVaTen,
    donVi: profile.donVi,
    capBac: profile.capBac,
    chucVu: profile.chucVu,
    ngach: profile.ngach,
    bacHienTai: profile.bacLuongHienTai,
    heSoHienTai: profile.heSoLuongHienTai,
    ngayHuongHienTai: profile.ngayHuongHienTai,
    soThangDaGiuBac: elapsedMonths,
    loaiNangLuong,
    bacDeXuat,
    heSoDeXuat,
    vuotKhungDeXuat,
    ngayHuongMoi,
    chenhLechHeSo,
    chenhLechTienLuong,
    lyDoDeXuat,
    khenThuong: profile.khenThuongGanNhat,
    kyLuat: profile.kyLuatGanNhat,
    trangThaiPheDuyet: loaiNangLuong === 'Chưa đủ điều kiện' ? 'Bảo lưu' : 'Chờ duyệt',
    yKienHoiDong: '',
  };
}
