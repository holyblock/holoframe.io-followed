//
// Copyright (C) Microsoft Corporation. All rights reserved.
//
#include "pch.h"
#include <iostream>
#include <fstream>
using namespace std;

static char* imageBuffer = new char[1280 * 720 * 4];

HRESULT SimpleFrameGenerator::Initialize(_In_ IMFMediaType* pMediaType)
{
  RETURN_HR_IF_NULL(E_INVALIDARG, pMediaType);

  RETURN_IF_FAILED(pMediaType->GetGUID(MF_MT_SUBTYPE, &m_subType));
  if (m_subType != MFVideoFormat_RGB32 && m_subType != MFVideoFormat_NV12)
  {
    RETURN_HR_MSG(MF_E_UNSUPPORTED_FORMAT, "Unsupported format: %s", winrt::to_hstring(m_subType).data());
  }
  MFGetAttributeSize(pMediaType, MF_MT_FRAME_SIZE, &m_width, &m_height);

  return S_OK;
}

/*:
   Writes to a buffer representing a 2D image.
   Writes a different constant to each line based on row number and current time.
   Assumes top down image, no negative stride and pBuf points to the begnning of the buffer of length len.
   Param:
   pBuf - pointer to beginning of buffer
   pitch - line length in bytes
   len - length of buffer in bytes
*/
HRESULT SimpleFrameGenerator::CreateFrame(
  _Inout_updates_bytes_(len) BYTE* pBuf,
  _In_ DWORD len,
  _In_ LONG pitch,
  _In_ ULONG rgbMask)
{
  if (m_subType == MFVideoFormat_RGB32)
  {
    DEBUG_MSG(L"RGB32 frames %s\n", winrt::to_hstring(MFVideoFormat_RGB32).data());

    RETURN_IF_FAILED(_CreateRGB32Frame(pBuf, len, pitch, m_width, m_height, rgbMask));
  }
  else if (m_subType == MFVideoFormat_NV12)
  {
    DEBUG_MSG(L"NV12 frames %s \n", winrt::to_hstring(MFVideoFormat_NV12).data());

    DWORD frameBuffLen = m_width * m_height * 4;
    wil::unique_cotaskmem_ptr<BYTE[]> spBuff = wil::make_unique_cotaskmem_nothrow<BYTE[]>(frameBuffLen);
    RETURN_IF_NULL_ALLOC(spBuff.get());

    RETURN_IF_FAILED(_CreateRGB32Frame(spBuff.get(), frameBuffLen, m_width * 4, m_width, m_height, rgbMask));
    RETURN_IF_FAILED(RGB32ToNV12Frame(spBuff.get(), frameBuffLen, m_width * 4, m_width, m_height, pBuf, len, pitch));
  }
  else
  {
    return MF_E_UNSUPPORTED_FORMAT;
  }

  return S_OK;
}

//////////////////////////////////////////////////
// private

HRESULT SimpleFrameGenerator::_CreateRGB32Frame(
    _Inout_updates_bytes_(len) BYTE* pBuf,
    _In_ DWORD len,
    _In_ LONG pitch,
    _In_ DWORD width,
    _In_ DWORD height,
    _In_ ULONG rgbMask )
{
  RETURN_HR_IF_NULL(E_INVALIDARG, pBuf);


  streampos size;

  ifstream file("C:\\hologram\\holocam.bmp", ios::in | ios::binary | ios::ate);
  if (file.is_open())
  {
    size = file.tellg();
    file.seekg(0, ios::beg);

    file.read(imageBuffer, size);
    file.close();

    for (unsigned int y = 0; y < height; y++)
    {
      uint32_t* p = (uint32_t*)(pBuf + (y * pitch));

      char* imageBufferPointer = (char*)imageBuffer + (y * pitch);


      for (unsigned int x = 0; x < width; x++)
      {
        //uint8_t red = 0;
        //uint8_t green = 255;
        //uint8_t blue = 0;
        //uint32_t color = 0xff00ff00;
        //if (y < 50 || y > height - 50 || x < 50 || x > width - 50) {
        //    color = 0xffff0000;
        //}

        uint8_t r = (uint8_t)*imageBufferPointer;
        imageBufferPointer++;
        uint8_t g = (uint8_t)*imageBufferPointer;
        imageBufferPointer++;
        uint8_t b = (uint8_t)*imageBufferPointer;
        imageBufferPointer++;
        uint8_t alpha = (uint8_t)*imageBufferPointer;
        imageBufferPointer++;

        *p = (alpha << 24) | (r << 16) | (g << 8) | b;

        p++;
      }
    }

    //delete[] imageBuffer;

  }

  return S_OK;
}

//////////////////////////////////////////////////
// pixelFormatConverter

void SimpleFrameGenerator::RGB24ToYUY2(int R, int G, int B, BYTE* pY, BYTE* pU, BYTE* pV)
{
  *pY = ((66 * R + 129 * G + 25 * B + 128) >> 8) + 16;
  *pU = ((-38 * R - 74 * G + 112 * B + 128) >> 8) + 128;
  *pV = ((112 * R - 94 * G - 18 * B + 128) >> 8) + 128;
}

void SimpleFrameGenerator::RGB24ToY(int R, int G, int B, BYTE* pY)
{
  *pY = ((66 * R + 129 * G + 25 * B + 128) >> 8) + 16;
}

void SimpleFrameGenerator::RGB32ToNV12(BYTE RGB1[8], BYTE RGB2[8], BYTE* pY1, BYTE* pY2, BYTE* pUV)
{
  RGB24ToYUY2(RGB1[2], RGB1[1], RGB1[0], pY1, pUV, pUV + 1);
  RGB24ToY(RGB1[6], RGB1[5], RGB1[4], pY1 + 1);
  RGB24ToYUY2(RGB2[2], RGB2[1], RGB2[0], pY2, pUV, pUV + 1);
  RGB24ToY(RGB2[6], RGB2[5], RGB2[4], pY2 + 1);
};

//////////////////////////////////////////////////
// FrameFormatConverter

HRESULT SimpleFrameGenerator::RGB32ToNV12Frame(_Inout_updates_bytes_(len) BYTE* pbBuff, ULONG cbBuff, long stride, UINT width, UINT height, BYTE* pbBuffOut, ULONG cbBuffOut, long strideOut)
{
  do
  {
    RETURN_HR_IF(E_UNEXPECTED, width * 4 * height > cbBuff);
    RETURN_HR_IF(E_UNEXPECTED, width * 1.5 * height > cbBuffOut);
    RETURN_HR_IF_NULL(E_INVALIDARG, pbBuff);

    RETURN_HR_IF_NULL(E_INVALIDARG, pbBuffOut);
    for (DWORD h = 0; h < height - 1; h += 2)
    {
      BYTE* pRGB1 = h * stride + pbBuff;
      BYTE* pRGB2 = (h + 1) * stride + pbBuff;
      BYTE* pY1 = h * strideOut + pbBuffOut;
      BYTE* pY2 = (h + 1) * strideOut + pbBuffOut;
      BYTE* pUV = (h / 2 + height) * strideOut + pbBuffOut;

      for (DWORD w = 0; w < width; w += 2)
      {
        RGB32ToNV12(pRGB1, pRGB2, pY1, pY2, pUV);
        pRGB1 += 8;
        pRGB2 += 8;
        pY1 += 2;
        pY2 += 2;
        pUV += 2;
      }
    }
  } while (FALSE);

  return S_OK;
}
