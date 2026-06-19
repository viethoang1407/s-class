'use client'

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface ExportData {
    fileName: string
    sheetName: string
    data: any[]
    headers: string[]
}

export function exportToExcel({ fileName, sheetName, data, headers }: ExportData) {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()

    // Add headers
    const ws = XLSX.utils.aoa_to_sheet([headers])

    // Add data rows
    XLSX.utils.sheet_add_json(ws, data, { origin: 'A2', skipHeader: true })

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 20 }))
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

    // Save file
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `${fileName}.xlsx`)
}

export function exportGradesToExcel(classData: any, grades: any[], subjects: any[]) {
    const headers = ['STT', 'Họ tên']

    // Add subject/component headers
    subjects.forEach((subject: any) => {
        subject.gradeComponents?.forEach((comp: any) => {
            headers.push(`${subject.name} - ${comp.name}`)
        })
    })
    headers.push('Điểm TB')

    // Build data rows
    const data = classData.members.map((member: any, index: number) => {
        const row: any = {
            stt: index + 1,
            name: member.displayName || member.user?.name || 'N/A',
        }

        let totalScore = 0
        let totalCount = 0

        subjects.forEach((subject: any) => {
            subject.gradeComponents?.forEach((comp: any) => {
                const grade = grades.find(
                    (g: any) => g.userId === member.user?.id && g.componentId === comp.id
                )
                const score = grade?.score ?? ''
                row[`${subject.name}_${comp.name}`] = score
                if (score !== '') {
                    totalScore += score
                    totalCount++
                }
            })
        })

        row.average = totalCount > 0 ? (totalScore / totalCount).toFixed(1) : ''
        return Object.values(row)
    })

    exportToExcel({
        fileName: `Diem_${classData.name}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}`,
        sheetName: 'Bảng điểm',
        data,
        headers,
    })
}

export function exportAttendanceToExcel(classData: any, sessions: any[]) {
    const headers = ['STT', 'Họ tên', ...sessions.map((s: any) =>
        new Date(s.date).toLocaleDateString('vi-VN')
    ), 'Tỉ lệ']

    const data = classData.members.map((member: any, index: number) => {
        const row: any[] = [
            index + 1,
            member.displayName || member.user?.name || 'N/A',
        ]

        let presentCount = 0
        sessions.forEach((session: any) => {
            const record = session.records?.find((r: any) => r.userId === member.user?.id)
            const status = record?.status === 'PRESENT' ? 'Có mặt' :
                record?.status === 'LATE' ? 'Muộn' :
                    record?.status === 'EXCUSED' ? 'Có phép' : 'Vắng'
            row.push(status)
            if (record?.status === 'PRESENT' || record?.status === 'LATE') {
                presentCount++
            }
        })

        row.push(sessions.length > 0 ? `${Math.round((presentCount / sessions.length) * 100)}%` : '0%')
        return row
    })

    exportToExcel({
        fileName: `DiemDanh_${classData.name}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}`,
        sheetName: 'Điểm danh',
        data,
        headers,
    })
}
